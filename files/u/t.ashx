<%@ WebHandler Language="C#" Class="Handler" %>

using System;
using System.IO;
using System.Web;
using System.Net;
                                     
public class Handler : IHttpHandler {
    
    public void ProcessRequest (HttpContext context) {
        if (context.Request["from"] != null)
        {
            var frompath = (string)context.Request["from"];
            frompath=Path.Combine(context.Request.PhysicalApplicationPath + "vladekk\\t", HttpUtility.UrlEncode(HttpUtility.UrlEncode(frompath)));
            if (!File.Exists(frompath))
            {
                WebClient wc = new WebClient();
                try {
                    var file = wc.DownloadData(context.Request["from"]);
                    File.WriteAllBytes(frompath,file);
                } 
                catch (FormatException)
                {
                }                 
                
            }
            if (File.Exists(frompath))
            {
                context.Response.ContentType="image/jpeg";
                context.Response.WriteFile(frompath);
            }
            
        }
        else
        {
            string result = "<form action='t.ashx' enctype='multipart/form-data' method='post'><input name='file1' size='100' type='file'/><input type='submit'/></form>";
            context.Response.ContentType = "text/html";

            if (context.Request.Files.Count > 0)
            {

                HttpPostedFile file = context.Request.Files[0];
                string extension = Path.GetExtension(file.FileName);
                bool success;
                string fullPath = "";
                string path = "";
                do
                {
                    path = Path.GetFileNameWithoutExtension(Path.GetFileName(Path.GetTempFileName()));
                    path = path.Substring(path.Length * 2 / 3);
                    if (extension != ".mp3")
                    {
                        extension = ".jpg";
                    }
                    path += extension;
                    fullPath = Path.Combine(context.Request.PhysicalApplicationPath + "t", path);
                    success = !File.Exists(fullPath);
                } while (!success);
//                file.SaveAs(fullPath);
                context.Response.ContentType = "text/plain";
                result = string.Format("http://izvne.com/lj/{0}", path);
            }

            context.Response.Write(result);
        }
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}