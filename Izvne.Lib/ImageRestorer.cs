using System;
using System.IO;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Izvne.Lib
{
    public class ImageRestorer
    {
        private readonly string _filesPath;

        private string ToMd5Hex(string src)
        {
            using (var md5 = MD5.Create())
            {
                return BitConverter.ToString(md5.ComputeHash(Encoding.UTF8.GetBytes(src))).Replace("-", "");
            }
        }

        public ImageRestorer(string filesPath)
        {
            _filesPath = filesPath;
        }

        
        public async Task<string> VerifyAndRestoreImage(string url)
        {
            if (url.StartsWith("http", StringComparison.InvariantCultureIgnoreCase))
            {
                var filename = ToMd5Hex(url) +  Path.GetExtension(url);
                var filePath = Path.Combine(_filesPath, filename);

                if (!File.Exists(filePath))
                {
                    using (var wc = new WebClient())
                    {
                        await wc.DownloadFileTaskAsync(new Uri(url), filePath);
                        return filePath;
                    }
                }
            }

            return null;
        }
    }
}