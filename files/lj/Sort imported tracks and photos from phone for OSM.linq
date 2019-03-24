<Query Kind="Program">
  <Reference>&lt;RuntimeDirectory&gt;\Accessibility.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\PresentationCore.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\WPF\PresentationFramework.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\PresentationUI.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\ReachFramework.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Configuration.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Deployment.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\System.Printing.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Runtime.InteropServices.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Windows.Forms.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\System.Xaml.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\UIAutomationProvider.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\UIAutomationTypes.dll</Reference>
  <Reference>&lt;RuntimeDirectory&gt;\wpf\WindowsBase.dll</Reference>
  <Namespace>System.Runtime.InteropServices</Namespace>
  <Namespace>System.Windows</Namespace>
  <Namespace>System.Windows.Forms</Namespace>
  <Namespace>System.Threading.Tasks</Namespace>
</Query>


//setup
static string name = "Repin";
static string osmFolder = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "OSM");
static string olympFolder = @"DCIM\\100OLYMP\\";
static string picsFolder = @"C:\\Pics\\";
static string motLabel = "MOT";

string[] args;
void Main(string[] args)
{
	this.args = args;
	if (args != null && args.Any())
	{
		SortAndCopy(args[0], picsFolder);
	}
	else
	{
		MyExtensions.RunScript(Body, name);
	}
}
private void Body()
{




	// logic


	while (true)
	{		


		var motDrive = DriveInfo.GetDrives().FirstOrDefault(d => d.IsReady && d.VolumeLabel == motLabel);
		if (motDrive != null)
		{
			var fullPath = Path.Combine(motDrive.Name, olympFolder);
			SortAndCopy(fullPath, picsFolder, true);
		}
		SortAndCopy(osmFolder, osmFolder);


		//			Vladekk.SendMail(name, ex.Message);
		//			Process.GetCurrentProcess().Kill();

		Thread.Sleep(2000);
		//olympusWatcher.WaitForChanged(WatcherChangeTypes.All);
	}
}
// Define other methods and classes here
private static void OnOsmFolderChanged(object source, FileSystemEventArgs e)
{
	SortAndCopy(osmFolder, osmFolder);
}


private static void SortAndCopy(string folderFrom, string folderTo, bool move = true)
{



	// get list of all jpg and gpx files
	var jpgs = Directory.GetFiles(folderFrom, "*.jpg");
	var gpxs = Directory.GetFiles(folderFrom, "*.gpx");
	var movs = Directory.GetFiles(folderFrom, "*.mov");
	var files = jpgs.Union(gpxs).Union(movs);
	var dateGrouped = files.GroupBy(f => File.GetLastWriteTime(f).Date.ToString("yyyy.MM.dd"));
	// group them by date and copy in folder for that date
	foreach (var date in dateGrouped)
	{
		var dateFolder = Path.Combine(folderTo, date.Key);
		Directory.CreateDirectory(dateFolder);
		foreach (var file in date)
		{
			var newFilename = Path.GetFileName(file);
			var newPath = Path.Combine(dateFolder, newFilename);
			if (File.Exists(newPath))
			{
				File.Delete(newPath);
			}
			if (move)
			{
				do
					try
					{
						File.Move(file, newPath);
					}
					catch (Exception e)
					{
						if (e.Message.Contains("another process"))
						{
							Thread.Sleep(100);
							continue;
						}
					} while (false);
			}
			else
			{
				File.Copy(file, newPath);
			}
		}
	}
}