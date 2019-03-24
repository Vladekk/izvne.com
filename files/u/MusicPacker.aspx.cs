using System;
using System.Collections.Generic;
using System.Configuration;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

public partial class _Default : System.Web.UI.Page 
{
    string musicFolder = ConfigurationManager.AppSettings["MusicFolder"];
    string packFolder = ConfigurationManager.AppSettings["PackFolder"];
    protected void Page_Load(object sender, EventArgs e)
    {
       
        grid.DataSource = Directory.GetDirectories(musicFolder).Select(f => new {Folder = f, Name=Path.GetFileName(f)}).ToList();
        grid.DataBind();

    }
    public class FolderData
    {
        public string Name { get; set; }
    }

    

    protected void lbPack_Command(object sender, CommandEventArgs e)
    {
        var folder = e.CommandArgument.ToString();
       
        var p = new Process();
        p.StartInfo.FileName = "zip";
        var fileName = Path.GetFileName(folder);
        var args=string.Format("-r \"{0}/{1}.zip\" \"{2}\" ", packFolder.Trim('/'), fileName, folder);
        p.StartInfo.Arguments = args;
        lblLog.Text = args;
        p.Start();
    }
}
