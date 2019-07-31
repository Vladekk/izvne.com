using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using Google.Apis.Auth.OAuth2;
using Google.Apis.PhotosLibrary.v1;
using Google.Apis.PhotosLibrary.v1.Data;
using Google.Apis.Services;
using Google.Apis.Util.Store;
using LINQPad;
using Newtonsoft.Json;

namespace Izvne.Scripting
{
    internal class Program
    {
        private static bool _uploadPhotos = false;
        private static bool _getFinalUrls = true;
        private static bool changePostUrls = true;
        private const string AaUrl = "https://get.google.com/albumarchive/101096522944241604628";

        private static string AuthCookie = "";

        private const string AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";

        private static string ClientId = "276048709422-3ov23ibvjjlv28v4f9hmsrbnb4l4igl7.apps.googleusercontent.com";
        private static string ClientSecret = "KKBt9jn6cqBQxqCOF2dTKXkl";
        private const string TokenEndpoint = "https://www.googleapis.com/oauth2/v4/token";
        private const string UserInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";


        private static string[] GetFinalUrls(string albumname)
        {
            string oneAlbumPageHtml;
            using (var webClient = new WebClient())
            {
                webClient.Headers.Add("Cookie", AuthCookie);
                var allAlbumsPageHtml = Encoding.UTF8.GetString(webClient.DownloadData(AaUrl));

                var match = Regex.Split(allAlbumsPageHtml, "\n").Where(l => l.Contains($",\"{albumname}\""))
                                 .Select(str => str.Trim(','))
                                 .FirstOrDefault();

                var albumUrl = $"{AaUrl}/album/{match?.Split('"')[5]}";

                oneAlbumPageHtml = Encoding.UTF8.GetString(webClient.DownloadData(albumUrl));
            }

            var lines = Regex.Split(oneAlbumPageHtml, "\n")
                             .FirstOrDefault(l => l.Contains("googleusercontent") && l.Contains("=w"));
            var results = new List<string>();

            var imagePattern = @"img src=""([^""=]+)";
            var matches = Regex.Matches(lines, imagePattern);
            matches.Count.Dump("Found matches");
            foreach (Match m in matches)
            {
                results.Add(m.Groups[1].Value.Dump());
            }

            return results.ToArray();
        }

        public static string[] GetImagesInFile(string path)
        {
            var result = new List<string>();
            var lines = File.ReadAllLines(path);

            {
                foreach (var line in lines)
                {
                    var pattern = @"\!\[[^]]*\]+\(([^)]+)\)";

                    var matches = Regex.Match(line, pattern);
                    using (var wc = new WebClient())
                    {
                        if (matches.Success)
                        {
                            var val = matches.Groups[1].Value;
                            if (!val.Contains("http"))
                            {
                                result.Add(val);
                            }
                        }
                    }

                    ;
                }

                return result.ToArray();
            }
        }

        public string GetPermUrl(string photoSharingUrl)
        {
            var wc = new WebClient();
            //wc.DownloadString();
            var col = new NameValueCollection();
            col.Add("googlephotos", photoSharingUrl);
            wc.Headers.Add("Referer", "https://ctrlq.org/google/photos/");

            var r = wc.UploadValues("https://ctrlq.org/google/photos/og.php", col);
            var json = Encoding.UTF8.GetString(r).Dump();
            var res = (string) JsonConvert.DeserializeObject<dynamic>(json).image;
            return res;
        }

        public static void Main(string[] args)
        {
            ClientId = ConfigurationManager.AppSettings["GoogleClientId"].ToString();
            ClientSecret = ConfigurationManager.AppSettings["GoogleClientSecret"].ToString();
            AuthCookie = ConfigurationManager.AppSettings["GoogleAuthCookie"].ToString();
            var (service, accessToken) = PrepareService();

            //config
            _uploadPhotos = true;
            var doAuth = true;


            var postPath =
                @"D:\Docs\Source\Izvne.com\Izvne.com\input\post\Шотландия\Шотландия — 3\Шотландия — 3, день первый, неприятность номер один.md";

            var allPosts = Directory.GetFiles(@"D:\Docs\Source\Izvne.com\Izvne.com\input\post\", "*.md",
                                              SearchOption.AllDirectories);

            foreach (var onePostPath in allPosts)
            {
                onePostPath.Dump("Processing file");
                ProcessOnePost(onePostPath, service, accessToken);
            }
        }

        private static (PhotosLibraryService, string) PrepareService()
        {
            UserCredential credential = GoogleWebAuthorizationBroker.AuthorizeAsync(
                                                                                    new ClientSecrets
                                                                                    {
                                                                                        ClientId = ClientId,
                                                                                        ClientSecret = ClientSecret
                                                                                    },
                                                                                    new[]
                                                                                    {
                                                                                        PhotosLibraryService
                                                                                            .Scope.Photoslibrary,
                                                                                        PhotosLibraryService.Scope
                                                                                                            .PhotoslibrarySharing
                                                                                    },
                                                                                    "user",
                                                                                    CancellationToken.None,
                                                                                    new
                                                                                        FileDataStore("BlogUploader.PhotosLibraryService"))
                                                                    .Result;

//            UserCredential credential =
//                Util.Cache(() =>
//                           {
//                              
//                           }, nameof(credential));

            var serv = new PhotosLibraryService(new BaseClientService.Initializer
                                                {
                                                    HttpClientInitializer = credential
                                                });
            return (serv, credential.Token.AccessToken);
        }

        private static void ProcessOnePost(string postPath, PhotosLibraryService photosService,
                                           string accessToken)
        {
            var postPathName = Path.GetFileNameWithoutExtension(postPath);
            var imageFilenames = GetImagesInFile(postPath);

            if (imageFilenames.Any())
            {
                imageFilenames.Length.Dump("Found images to process ");
                if (_uploadPhotos)
                {
                    "Starting upload of the photos".Dump();
                    UploadPhotos(postPath, photosService, accessToken, postPathName, imageFilenames);
                }

                if (_getFinalUrls)
                {
                    var finalUrls = GetFinalUrls(postPathName);

                    if (changePostUrls)
                    {
                        var i = 0;
                        if (imageFilenames.Length != finalUrls.Length)
                        {
                            throw new Exception("Image count mismatch");
                        }

                        var postText = File.ReadAllText(postPath);
                        foreach (var imageFilename in imageFilenames)
                        {
                            postText = postText.Replace(imageFilename, finalUrls[i]);
                            i++;
                        }

                        File.WriteAllText(postPath, postText);
                    }
                }
            }
        }

        private static void UploadPhotos(string postPath, PhotosLibraryService photosService, string accessToken,
                                         string postPathName, string[] imageFilenames)
        {
            var albums = photosService.Albums.List().Execute();
            if (albums.Albums.Any(a => a.Title == postPathName && a.MediaItemsCount == imageFilenames.Length))
            {
                "Found existing album with same photo count, skipping".Dump();
                return;
            }

            var albumRq = new CreateAlbumRequest {Album = new Album {Title = postPathName}};

            var response = photosService.Albums.Create(albumRq).Execute().Dump("Created album");


            var photosRq = new BatchCreateMediaItemsRequest
                           {
                               AlbumId = response.Id,
                               NewMediaItems = new List<NewMediaItem>()
                           };

            var shareRq = new ShareAlbumRequest
                          {
                              SharedAlbumOptions = new SharedAlbumOptions
                                                   {IsCollaborative = false, IsCommentable = false}
                          };

            var shareResp = photosService.Albums.Share(shareRq, photosRq.AlbumId).Execute().Dump();
            shareResp.Dump("Shared album");


            foreach (var imageFilename in imageFilenames)
            {
                var imagePath = Path.Combine(Path.GetDirectoryName(postPath), imageFilename);
                var uploadId = UploadImage(imagePath, accessToken);

                photosRq.NewMediaItems.Add(new NewMediaItem
                                           {
                                               SimpleMediaItem = new SimpleMediaItem {UploadToken = uploadId}
                                           });
            }


            var addedPhoto = photosService.MediaItems.BatchCreate(photosRq).Execute().Dump("Uploaded photos");
        }

        private static string UploadImage(string fullPath, string token)
        {
            var fS = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            var b = new byte[fS.Length];
            fS.Read(b, 0, (int) fS.Length);
            fS.Close();
            var httpWebRequest = (HttpWebRequest) WebRequest.Create("https://photoslibrary.googleapis.com/v1/uploads");
            httpWebRequest.ContentType = "application/octet-stream";

            httpWebRequest.Headers.Add("Authorization:" + "Bearer " + token);
            httpWebRequest.Headers.Add("X-Goog-Upload-File-Name:" + Path.GetFileNameWithoutExtension(fullPath));
            httpWebRequest.Headers.Add("X-Goog-Upload-Protocol:" + "raw");
            httpWebRequest.Method = "POST";
            using (var stream = httpWebRequest.GetRequestStream())
            {
                stream.Write(b, 0, b.Length);
                stream.Flush();
                stream.Close();
            }

            var httpResponse = (HttpWebResponse) httpWebRequest.GetResponse();
            var str = httpResponse.GetResponseStream();
            TextReader sr = new StreamReader(str);
            return sr.ReadToEnd();
        }
    }
}