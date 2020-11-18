<Query Kind="Program">
  <NuGetReference>Gkmo.Google.Apis.PhotosLibrary.v1</NuGetReference>
  <NuGetReference>Google.Apis</NuGetReference>
  <NuGetReference>Newtonsoft.Json</NuGetReference>
  <Namespace>Google</Namespace>
  <Namespace>Google.Apis</Namespace>
  <Namespace>Google.Apis.Auth</Namespace>
  <Namespace>Google.Apis.Auth.OAuth2</Namespace>
  <Namespace>Google.Apis.Auth.OAuth2.Flows</Namespace>
  <Namespace>Google.Apis.Auth.OAuth2.Requests</Namespace>
  <Namespace>Google.Apis.Auth.OAuth2.Responses</Namespace>
  <Namespace>Google.Apis.Auth.OAuth2.Web</Namespace>
  <Namespace>Google.Apis.Discovery</Namespace>
  <Namespace>Google.Apis.Download</Namespace>
  <Namespace>Google.Apis.Http</Namespace>
  <Namespace>Google.Apis.Json</Namespace>
  <Namespace>Google.Apis.Logging</Namespace>
  <Namespace>Google.Apis.PhotosLibrary.v1</Namespace>
  <Namespace>Google.Apis.PhotosLibrary.v1.Data</Namespace>
  <Namespace>Google.Apis.Requests</Namespace>
  <Namespace>Google.Apis.Requests.Parameters</Namespace>
  <Namespace>Google.Apis.Services</Namespace>
  <Namespace>Google.Apis.Testing</Namespace>
  <Namespace>Google.Apis.Upload</Namespace>
  <Namespace>Google.Apis.Util</Namespace>
  <Namespace>Google.Apis.Util.Store</Namespace>
  <Namespace>Newtonsoft.Json</Namespace>
  <Namespace>Newtonsoft.Json.Bson</Namespace>
  <Namespace>Newtonsoft.Json.Converters</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>Newtonsoft.Json.Schema</Namespace>
  <Namespace>Newtonsoft.Json.Serialization</Namespace>
  <Namespace>System.Net.Http</Namespace>
  <Namespace>System.Net.Http.Headers</Namespace>
  <Namespace>System.Net.Sockets</Namespace>
  <Namespace>System.Net</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
  <Namespace>System.Security.Cryptography</Namespace>
  <Namespace>System.Collections.Specialized</Namespace>
</Query>

void Main()
{
//config

var uploadPhotos=false;


	UserCredential credential =
	Util.Cache(() =>
	{
		return GoogleWebAuthorizationBroker.AuthorizeAsync(
		   new ClientSecrets
		   {
			   ClientId = clientId,
			   ClientSecret = clientSecret
		   },
		   new[] { PhotosLibraryService.Scope.Photoslibrary, PhotosLibraryService.Scope.PhotoslibrarySharing },
		   "user",
		   CancellationToken.None,
		   new FileDataStore("BlogUploader.PhotosLibraryService")).Result;
	}, nameof(credential));

	var serv = new PhotosLibraryService(new BaseClientService.Initializer
	{
		HttpClientInitializer = credential
		//		ApplicationName = "BlogUploader",
		//		ApiKey = "ya29.GltVB1r857QYafID4q7LdNtQCeCKMgW5GsB6_qz2Xf-p2ut8UT7i5uQ_5wEb_olZOufSBNTyLLim-5faEWq2l4aFQzAOZe1jPz4zCpY_hsChyYUAGQr2gt8NAR7H"		,

	});
	
uploadPhotos=true	;

	var postPath = @"D:\Docs\Source\Izvne.com\Izvne.com\input\post\Шотландия\Шотландия — 3\Шотландия — 3, день первый, неприятность номер один.md";
	
	var postPathName = Path.GetFileNameWithoutExtension(postPath);
	var imageFilenames = GetImagesInFile(postPath);
	if (uploadPhotos){
	

	//var als=serv.Albums.List().Execute();



	var body = new CreateAlbumRequest();
	body.Album = new Album();	
	body.Album.Title =  postPathName;
	//body.Album.ShareInfo = new ShareInfo() { SharedAlbumOptions = new SharedAlbumOptions() {IsCollaborative=false,IsCommentable=false}};
	var reponse = serv.Albums.Create(body).Execute().Dump();



	
	var body2 = new BatchCreateMediaItemsRequest()
	{
		AlbumId = reponse.Id,
		NewMediaItems = new List<Google.Apis.PhotosLibrary.v1.Data.NewMediaItem>()
	};

	ShareAlbumRequest sar = new ShareAlbumRequest() { SharedAlbumOptions = new SharedAlbumOptions() { IsCollaborative = false, IsCommentable = false }};
	
	var sresp = serv.Albums.Share(sar, body2.AlbumId).Execute().Dump();

	var addedPhotoUrls = new List<string>();
	
	
	foreach (var imageFilename in imageFilenames)
	{
		var imagePath = Path.Combine(Path.GetDirectoryName(postPath), imageFilename);
		var uploadId = UploadImage(imagePath, credential.Token.AccessToken);

		body2.NewMediaItems.Add(new NewMediaItem()
		{
			SimpleMediaItem = new SimpleMediaItem() { UploadToken = uploadId }

		});


		}


		var addedPhoto = serv.MediaItems.BatchCreate(body2).Execute().Dump();

	}

	var getFinalUrls = true;
	if (getFinalUrls)
	{
		var finalUrls=GetFinalUrls(postPathName);
		int i=0;
		foreach(var imageF in imageFilenames){
		    (finalUrls[i],imageF).Dump();
			i++;
		}
		
	}

//	var urls = addedPhoto.NewMediaItemResults.Select(r => r.MediaItem.ProductUrl).ToArray();
//	urls.Dump();



	//	doOAuth();

}


public string[] GetFinalUrls(string albumname )
{
	var wcForAa = new WebClient();
	wcForAa.Headers.Add("Cookie", authCookie);
	var res=Encoding.UTF8.GetString(wcForAa.DownloadData(aaUrl));
	
	var match=Regex.Split(res,"\n").Where(l=>l.Contains($",\"{albumname}\"")).Select(str=>str.Trim(',')).FirstOrDefault();

	var albumUrl=$"{aaUrl}/album/{match?.Split('"')[5]}";
	
	 res=Encoding.UTF8.GetString(wcForAa.DownloadData(albumUrl));
	 
	 var lines=Regex.Split(res,"\n").Where(l=>l.Contains($"googleusercontent") && l.Contains("=w")).FirstOrDefault();
	 var results = new List<string>();
	 foreach(Match m in Regex.Matches(lines,@"img src=""([^""=]+)")){
	 	results.Add(m.Groups[1].Value.Dump());
	 }
	 
	 return results.ToArray();
	
}

public string UploadImage(string fullPath, string token)
{
	FileStream fS = new FileStream(fullPath, FileMode.Open, FileAccess.Read);
	byte[] b = new byte[fS.Length];
	fS.Read(b, 0, (int)fS.Length);
	fS.Close();
	var httpWebRequest = (HttpWebRequest)WebRequest.Create("https://photoslibrary.googleapis.com/v1/uploads");
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
	var httpResponse = (HttpWebResponse)httpWebRequest.GetResponse();
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
	var res = (string)JsonConvert.DeserializeObject<dynamic>(json).image;
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
			};
		}
		return result.ToArray();
	}
}
public const string clientId = "276048709422-3ov23ibvjjlv28v4f9hmsrbnb4l4igl7.apps.googleusercontent.com";
public const string clientSecret = "KKBt9jn6cqBQxqCOF2dTKXkl";
const string authorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
const string tokenEndpoint = "https://www.googleapis.com/oauth2/v4/token";
const string userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";

const string aaUrl="https://get.google.com/albumarchive/101096522944241604628";
const string authCookie="CONSENT=YES+LV.ru+20160410-02-0; S=billing-ui-v3=QWBYsxsPARdklJOhGWMbcxbZMr06-zUJ:billing-ui-v3-efe=QWBYsxsPARdklJOhGWMbcxbZMr06-zUJ; OTZ=5018887_44_48_123900_44_436380; SID=mgdAedstvVNuVCUPVRtSn1JpsfPNWz4oA_8ib-1oYh-bKtG3nhqaIGNAPGYNg5WW5_dAtA.; HSID=AIdPjjStOEoCL2EGL; SSID=A5tQLZmaHBfKhhaSA; APISID=H2tFYZEXFPocDCQP/A5zAu3Bri3ehTJ3Kk; SAPISID=wAVJ8HmKDqRlSzB8/Ah9TTFkt3MmQthi9F; SEARCH_SAMESITE=CgQIu40B; 1P_JAR=2019-7-30-15; NID=188=SjnoUPTJVg6mfp7YPt9_qUcIL6Ef5DK74qF0Q4n-8gb2Vz4maBTypmMCh7sVi4sWsu26s25kTIZFLGqGUbwEQByjhXMl4HRfo_vZcv_jzH53R5uK-4ccHsfvi9C6XpnyK-q96P_P6xvFfWeVAlhkq1snlSFVONnr1pnVLq__idmzCwIyZWsyeNBPD3bsNMPtXLx-kl_wUDtpOUsNq-RBjOjRouzBGOjkZcY1PAW8jU1LnQTc62A8Z9Fc12cP2pIt4eLHvUgWqXHSW6w5iMk6t5n79QxPn7ce5OMG34vsJvl1cpDwycR_52Lm8MNRmdXTybdtl5MM7Gpw2cByhnUF2-oYpo8JGQ; SIDCC=AN0-TYsvt11riFowOC9ifjxslSsjZFNF2o0kx6MSLrNxN4gSC1NIFfezMc_Od7SJocv2FZNdpRM";


//
//public static int GetRandomUnusedPort()
//{
//	var listener = new TcpListener(IPAddress.Loopback, 0);
//	listener.Start();
//	var port = ((IPEndPoint)listener.LocalEndpoint).Port;
//	listener.Stop();
//	return port;
//}
//
//private async void doOAuth()
//{
//	// Generates state and PKCE values.
//	string state = randomDataBase64url(32);
//	string code_verifier = randomDataBase64url(32);
//	string code_challenge = base64urlencodeNoPadding(sha256(code_verifier));
//	const string code_challenge_method = "S256";
//
//	// Creates a redirect URI using an available port on the loopback address.
//	string redirectURI = string.Format("http://{0}:{1}/", IPAddress.Loopback, GetRandomUnusedPort());
//	output("redirect URI: " + redirectURI);
//
//	// Creates an HttpListener to listen for requests on that redirect URI.
//	var http = new HttpListener();
//	http.Prefixes.Add(redirectURI);
//	output("Listening..");
//	http.Start();
//
//	// Creates the OAuth 2.0 authorization request.
//	string authorizationRequest = string.Format("{0}?response_type=code&scope=openid%20profile&redirect_uri={1}&client_id={2}&state={3}&code_challenge={4}&code_challenge_method={5}",
//		authorizationEndpoint,
//		System.Uri.EscapeDataString(redirectURI),
//		clientId,
//		state,
//		code_challenge,
//		code_challenge_method);
//
//	// Opens request in the browser.
//	System.Diagnostics.Process.Start(authorizationRequest);
//
//	// Waits for the OAuth authorization response.
//	var context = await http.GetContextAsync();
//
//	// Brings the Console to Focus.
//	//BringConsoleToFront();
//
//	// Sends an HTTP response to the browser.
//	var response = context.Response;
//	string responseString = string.Format("<html><head><meta http-equiv='refresh' content='10;url=https://google.com'></head><body>Please return to the app.</body></html>");
//	var buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
//	response.ContentLength64 = buffer.Length;
//	var responseOutput = response.OutputStream;
//	Task responseTask = responseOutput.WriteAsync(buffer, 0, buffer.Length).ContinueWith((task) =>
//	{
//		responseOutput.Close();
//		http.Stop();
//		Console.WriteLine("HTTP server stopped.");
//	});
//
//	// Checks for errors.
//	if (context.Request.QueryString.Get("error") != null)
//	{
//		output(String.Format("OAuth authorization error: {0}.", context.Request.QueryString.Get("error")));
//		return;
//	}
//	if (context.Request.QueryString.Get("code") == null
//		|| context.Request.QueryString.Get("state") == null)
//	{
//		output("Malformed authorization response. " + context.Request.QueryString);
//		return;
//	}
//
//	// extracts the code
//	var code = context.Request.QueryString.Get("code");
//	var incoming_state = context.Request.QueryString.Get("state");
//
//	// Compares the receieved state to the expected value, to ensure that
//	// this app made the request which resulted in authorization.
//	if (incoming_state != state)
//	{
//		output(String.Format("Received request with invalid state ({0})", incoming_state));
//		return;
//	}
//	output("Authorization code: " + code);
//
//	// Starts the code exchange at the Token Endpoint.
//	performCodeExchange(code, code_verifier, redirectURI);
//}
//
//async void performCodeExchange(string code, string code_verifier, string redirectURI)
//{
//	output("Exchanging code for tokens...");
//
//	// builds the  request
//	string tokenRequestURI = "https://www.googleapis.com/oauth2/v4/token";
//	string tokenRequestBody = string.Format("code={0}&redirect_uri={1}&client_id={2}&code_verifier={3}&client_secret={4}&scope=&grant_type=authorization_code",
//		code,
//		System.Uri.EscapeDataString(redirectURI),
//		clientId,
//		code_verifier,
//		clientSecret
//		);
//
//	// sends the request
//	HttpWebRequest tokenRequest = (HttpWebRequest)WebRequest.Create(tokenRequestURI);
//	tokenRequest.Method = "POST";
//	tokenRequest.ContentType = "application/x-www-form-urlencoded";
//	tokenRequest.Accept = "Accept=text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
//	byte[] _byteVersion = Encoding.ASCII.GetBytes(tokenRequestBody);
//	tokenRequest.ContentLength = _byteVersion.Length;
//	Stream stream = tokenRequest.GetRequestStream();
//	await stream.WriteAsync(_byteVersion, 0, _byteVersion.Length);
//	stream.Close();
//
//	try
//	{
//		// gets the response
//		WebResponse tokenResponse = await tokenRequest.GetResponseAsync();
//		using (StreamReader reader = new StreamReader(tokenResponse.GetResponseStream()))
//		{
//			// reads response body
//			string responseText = await reader.ReadToEndAsync();
//			Console.WriteLine(responseText);
//
//			// converts to dictionary
//			Dictionary<string, string> tokenEndpointDecoded = JsonConvert.DeserializeObject<Dictionary<string, string>>(responseText);
//
//			string access_token = tokenEndpointDecoded["access_token"];
//			userinfoCall(access_token);
//		}
//	}
//	catch (WebException ex)
//	{
//		if (ex.Status == WebExceptionStatus.ProtocolError)
//		{
//			var response = ex.Response as HttpWebResponse;
//			if (response != null)
//			{
//				output("HTTP: " + response.StatusCode);
//				using (StreamReader reader = new StreamReader(response.GetResponseStream()))
//				{
//					// reads response body
//					string responseText = await reader.ReadToEndAsync();
//					output(responseText);
//				}
//			}
//
//		}
//	}
//}
//
//
//async void userinfoCall(string access_token)
//{
//	output("Making API Call to Userinfo...");
//
//	// builds the  request
//	string userinfoRequestURI = "https://www.googleapis.com/oauth2/v3/userinfo";
//
//	// sends the request
//	HttpWebRequest userinfoRequest = (HttpWebRequest)WebRequest.Create(userinfoRequestURI);
//	userinfoRequest.Method = "GET";
//	userinfoRequest.Headers.Add(string.Format("Authorization: Bearer {0}", access_token));
//	userinfoRequest.ContentType = "application/x-www-form-urlencoded";
//	userinfoRequest.Accept = "Accept=text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8";
//
//	// gets the response
//	WebResponse userinfoResponse = await userinfoRequest.GetResponseAsync();
//	using (StreamReader userinfoResponseReader = new StreamReader(userinfoResponse.GetResponseStream()))
//	{
//		// reads response body
//		string userinfoResponseText = await userinfoResponseReader.ReadToEndAsync();
//		output(userinfoResponseText);
//	}
//}
//
///// <summary>
///// Appends the given string to the on-screen log, and the debug console.
///// </summary>
///// <param name="output">string to be appended</param>
//public void output(string output)
//{
//	Console.WriteLine(output);
//}
//
///// <summary>
///// Returns URI-safe data with a given input length.
///// </summary>
///// <param name="length">Input length (nb. output will be longer)</param>
///// <returns></returns>
//public static string randomDataBase64url(uint length)
//{
//	RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
//	byte[] bytes = new byte[length];
//	rng.GetBytes(bytes);
//	return base64urlencodeNoPadding(bytes);
//}
//
///// <summary>
///// Returns the SHA256 hash of the input string.
///// </summary>
///// <param name="inputStirng"></param>
///// <returns></returns>
//public static byte[] sha256(string inputStirng)
//{
//	byte[] bytes = Encoding.ASCII.GetBytes(inputStirng);
//	SHA256Managed sha256 = new SHA256Managed();
//	return sha256.ComputeHash(bytes);
//}
//
///// <summary>
///// Base64url no-padding encodes the given input buffer.
///// </summary>
///// <param name="buffer"></param>
///// <returns></returns>
//public static string base64urlencodeNoPadding(byte[] buffer)
//{
//	string base64 = Convert.ToBase64String(buffer);
//
//	// Converts base64 to base64url.
//	base64 = base64.Replace("+", "-");
//	base64 = base64.Replace("/", "_");
//	// Strips padding.
//	base64 = base64.Replace("=", "");
//
//	return base64;
//}
//
//
//
//// Define other methods and classes here
//
///*
//redirect URI: http://127.0.0.1:64541/
//Listening..
//HTTP server stopped.
//Authorization code: 4/lgGoqNfuUyPAi9_jeScjR8SpOuIyuPBkWaelPP2CHN7iR4uSBa75sxONpMzvbxE-jkZ7HlLrc0OIPWsNMeKWsqg
//Exchanging code for tokens...
//{
//  "access_token": "ya29.GltVB1r857QYafID4q7LdNtQCeCKMgW5GsB6_qz2Xf-p2ut8UT7i5uQ_5wEb_olZOufSBNTyLLim-5faEWq2l4aFQzAOZe1jPz4zCpY_hsChyYUAGQr2gt8NAR7H",
//  "expires_in": 3600,
//  "refresh_token": "1/pUq3l8gv7BywvVC41gW_s6Tbdq86dp6x6rvTMFKRGeptzzRefuPVfKg31BhXGnE-",
//  "scope": "https://www.googleapis.com/auth/userinfo.profile openid",
//  "token_type": "Bearer",
//  "id_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImRmMzc1ODkwOGI3OTIyOTNhZDk3N2EwYjk5MWQ5OGE3N2Y0ZWVlY2QiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIyNzYwNDg3MDk0MjItM292MjNpYnZqamx2Mjh2NGY5aG1zcmJuYjRsNGlnbDcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIyNzYwNDg3MDk0MjItM292MjNpYnZqamx2Mjh2NGY5aG1zcmJuYjRsNGlnbDcuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDEwOTY1MjI5NDQyNDE2MDQ2MjgiLCJhdF9oYXNoIjoidHpiS0s0VXJWSzRWeU52Uy01b25zQSIsIm5hbWUiOiJWbGFkaXNsYXYgS3VnZWxldmljaCIsInBpY3R1cmUiOiJodHRwczovL2xoNi5nb29nbGV1c2VyY29udGVudC5jb20vLVBRTktyc1J5TWZnL0FBQUFBQUFBQUFJL0FBQUFBQUFBQVFjLzlqa3RUdzhWU0RRL3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJWbGFkaXNsYXYiLCJmYW1pbHlfbmFtZSI6Ikt1Z2VsZXZpY2giLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU2NDQ4MTM2OCwiZXhwIjoxNTY0NDg0OTY4fQ.IZ8qlGz-nQtQNOdFXTcPOlSUc9BjkF2k5rz3E9S9Ihqu7_USwg66U9xymtsk3jRi7wmog82_9EyN7npnOQFwPgxmRdZ3eEAeyyp0Z-7eMs32JDVZ-9SUJKUoBal_PPkQzZ0nstQmy2ysaF54fVHxqYurTiRlSd7WqDYqPT4zwbYb8FpbRs8nwoCu1EIasGsppJNfJnwWn0UhOME7DHpBS5hxUAu42opthbUFAgaqHzWR0rHq7oC6pH7b_8wYRLTG2A8PvXZDiwkCSl0K2Jde1SJmVdMJoufcvziwdK-_mCGD--I8aAUA1k5Z09AYiUvfgefH-L8tpq-rRXEVkIndSg"
//}
//Making API Call to Userinfo...
//{
//  "sub": "101096522944241604628",
//  "name": "Vladislav Kugelevich",
//  "given_name": "Vladislav",
//  "family_name": "Kugelevich",
//  "picture": "https://lh6.googleusercontent.com/-PQNKrsRyMfg/AAAAAAAAAAI/AAAAAAAAAQc/9jktTw8VSDQ/photo.jpg",
//  "locale": "en"
//}
//
//
//*/
//