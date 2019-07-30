namespace Izvne.Scripting
{
    internal class Program
    {
        public static void Main(string[] args)
        {
//config

            var uploadPhotos = false;


            UserCredential credential =
                Util.Cache(() =>
                           {
                               return GoogleWebAuthorizationBroker.AuthorizeAsync(
                                                                                  new ClientSecrets
                                                                                  {
                                                                                      ClientId = clientId,
                                                                                      ClientSecret = clientSecret
                                                                                  },
                                                                                  new[]
                                                                                  {
                                                                                      PhotosLibraryService
                                                                                          .Scope.Photoslibrary,
                                                                                      PhotosLibraryService
                                                                                          .Scope
                                                                                          .PhotoslibrarySharing
                                                                                  },
                                                                                  "user",
                                                                                  CancellationToken.None,
                                                                                  new
                                                                                      FileDataStore("BlogUploader.PhotosLibraryService"))
                                                                  .Result;
                           }, nameof(credential));

            var serv = new PhotosLibraryService(new BaseClientService.Initializer
                                                {
                                                    HttpClientInitializer = credential
                                                    //		ApplicationName = "BlogUploader",
                                                    //		ApiKey = "ya29.GltVB1r857QYafID4q7LdNtQCeCKMgW5GsB6_qz2Xf-p2ut8UT7i5uQ_5wEb_olZOufSBNTyLLim-5faEWq2l4aFQzAOZe1jPz4zCpY_hsChyYUAGQr2gt8NAR7H"		,
                                                });

            uploadPhotos = true;

            var postPath =
                @"D:\Docs\Source\Izvne.com\Izvne.com\input\post\Шотландия\Шотландия — 3\Шотландия — 3, день первый, неприятность номер один.md";

            var postPathName = Path.GetFileNameWithoutExtension(postPath);
            var imageFilenames = GetImagesInFile(postPath);
            if (uploadPhotos)
            {
                //var als=serv.Albums.List().Execute();


                var body = new CreateAlbumRequest();
                body.Album = new Album();
                body.Album.Title = postPathName;
                //body.Album.ShareInfo = new ShareInfo() { SharedAlbumOptions = new SharedAlbumOptions() {IsCollaborative=false,IsCommentable=false}};
                var reponse = serv.Albums.Create(body).Execute().Dump();


                var body2 = new BatchCreateMediaItemsRequest()
                            {
                                AlbumId = reponse.Id,
                                NewMediaItems = new List<Google.Apis.PhotosLibrary.v1.Data.NewMediaItem>()
                            };

                ShareAlbumRequest sar = new ShareAlbumRequest()
                                        {
                                            SharedAlbumOptions = new SharedAlbumOptions()
                                                                 {IsCollaborative = false, IsCommentable = false}
                                        };

                var sresp = serv.Albums.Share(sar, body2.AlbumId).Execute().Dump();

                var addedPhotoUrls = new List<string>();


                foreach (var imageFilename in imageFilenames)
                {
                    var imagePath = Path.Combine(Path.GetDirectoryName(postPath), imageFilename);
                    var uploadId = UploadImage(imagePath, credential.Token.AccessToken);

                    body2.NewMediaItems.Add(new NewMediaItem()
                                            {
                                                SimpleMediaItem = new SimpleMediaItem() {UploadToken = uploadId}
                                            });
                }


                var addedPhoto = serv.MediaItems.BatchCreate(body2).Execute().Dump();
            }

            var getFinalUrls = true;
            if (getFinalUrls)
            {
                var finalUrls = GetFinalUrls(postPathName);
                int i = 0;
                foreach (var imageF in imageFilenames)
                {
                    (finalUrls[i], imageF).Dump();
                    i++;
                }
            }

//	var urls = addedPhoto.NewMediaItemResults.Select(r => r.MediaItem.ProductUrl).ToArray();
//	urls.Dump();


            //	doOAuth();
        }


        public string[] GetFinalUrls(string albumname)
        {
            var wcForAa = new WebClient();
            wcForAa.Headers.Add("Cookie", authCookie);
            var res = Encoding.UTF8.GetString(wcForAa.DownloadData(aaUrl));

            var match = Regex.Split(res, "\n").Where(l => l.Contains($",\"{albumname}\"")).Select(str => str.Trim(','))
                             .FirstOrDefault();

            var albumUrl = $"{aaUrl}/album/{match?.Split('"')[5]}";

            res = Encoding.UTF8.GetString(wcForAa.DownloadData(albumUrl));

            var lines = Regex.Split(res, "\n").Where(l => l.Contains($"googleusercontent") && l.Contains("=w"))
                             .FirstOrDefault();
            var results = new List<string>();
            foreach (Match m in Regex.Matches(lines, @"img src=""([^""=]+)"))
            {
                results.Add(m.Groups[1].Value.Dump());
            }

            return results.ToArray();
        }

        public string UploadImage(string fullPath, string token)
        {
            FileStream fS = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
            byte[] b = new byte[fS.Length];
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

        public string GetPermUrl(string photoSharingUrl)
        {
            var wc = new WebClient();
            //wc.DownloadString();
            var col = new NameValueCollection();
            col.Add("googlephotos", photoSharingUrl);
            wc.Headers.Add("Referer", "https://ctrlq.org/google/photos/");

            var r = wc.UploadValues($"https://ctrlq.org/google/photos/og.php", col);
            var json = Encoding.UTF8.GetString(r).Dump();
            var res = (string) JsonConvert.DeserializeObject<dynamic>(json).image;
            return res;
        }

        public string[] GetImagesInFile(string path)
        {
            var result = new List<string>();
            var lines = File.ReadAllLines(path);
            //while (Console.In.Peek() != -1)
            {
                //var line = Console.ReadLine();//
                //var line="wfwf ![enter image description here](https://lh3.googleusercontent.com/jYdh5LNi5_3UzhCpMfx7NgCa3KeKklwsmmJ9bSPf4Tode4CowiVCjW80IMgSBhYgA4YV721slNUWCA) wfwf";
                foreach (var line in lines)
                {
                    var pattern = @"\!\[[^]]*\]+\(([^)]+)\)";

                    var matches = Regex.Match(line, pattern);
                    using (WebClient wc = new WebClient())
                    {
                        if (matches.Success)
                        {
                            var val = matches.Groups[1].Value;
                            result.Add(val);
                        }
                    }

                    ;
                }

                return result.ToArray();
            }
        }

        public const string clientId = "276048709422-3ov23ibvjjlv28v4f9hmsrbnb4l4igl7.apps.googleusercontent.com";
        public const string clientSecret = "KKBt9jn6cqBQxqCOF2dTKXkl";
        const string authorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
        const string tokenEndpoint = "https://www.googleapis.com/oauth2/v4/token";
        const string userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

        const string aaUrl = "https://get.google.com/albumarchive/101096522944241604628";

        const string authCookie =
            "CONSENT=YES+LV.ru+20160410-02-0; S=billing-ui-v3=QWBYsxsPARdklJOhGWMbcxbZMr06-zUJ:billing-ui-v3-efe=QWBYsxsPARdklJOhGWMbcxbZMr06-zUJ; OTZ=5018887_44_48_123900_44_436380; SID=mgdAedstvVNuVCUPVRtSn1JpsfPNWz4oA_8ib-1oYh-bKtG3nhqaIGNAPGYNg5WW5_dAtA.; HSID=AIdPjjStOEoCL2EGL; SSID=A5tQLZmaHBfKhhaSA; APISID=H2tFYZEXFPocDCQP/A5zAu3Bri3ehTJ3Kk; SAPISID=wAVJ8HmKDqRlSzB8/Ah9TTFkt3MmQthi9F; SEARCH_SAMESITE=CgQIu40B; 1P_JAR=2019-7-30-15; NID=188=SjnoUPTJVg6mfp7YPt9_qUcIL6Ef5DK74qF0Q4n-8gb2Vz4maBTypmMCh7sVi4sWsu26s25kTIZFLGqGUbwEQByjhXMl4HRfo_vZcv_jzH53R5uK-4ccHsfvi9C6XpnyK-q96P_P6xvFfWeVAlhkq1snlSFVONnr1pnVLq__idmzCwIyZWsyeNBPD3bsNMPtXLx-kl_wUDtpOUsNq-RBjOjRouzBGOjkZcY1PAW8jU1LnQTc62A8Z9Fc12cP2pIt4eLHvUgWqXHSW6w5iMk6t5n79QxPn7ce5OMG34vsJvl1cpDwycR_52Lm8MNRmdXTybdtl5MM7Gpw2cByhnUF2-oYpo8JGQ; SIDCC=AN0-TYsvt11riFowOC9ifjxslSsjZFNF2o0kx6MSLrNxN4gSC1NIFfezMc_Od7SJocv2FZNdpRM";
    }
}