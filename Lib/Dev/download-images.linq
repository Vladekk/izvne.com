<Query Kind="Program">
  <NuGetReference>Newtonsoft.Json</NuGetReference>
  <Namespace>Newtonsoft.Json</Namespace>
  <Namespace>Newtonsoft.Json.Bson</Namespace>
  <Namespace>Newtonsoft.Json.Converters</Namespace>
  <Namespace>Newtonsoft.Json.Linq</Namespace>
  <Namespace>Newtonsoft.Json.Schema</Namespace>
  <Namespace>Newtonsoft.Json.Serialization</Namespace>
  <Namespace>System.Net</Namespace>
</Query>

void Main()
{
	while (Console.In.Peek()!=-1)
	{
		var line = Console.ReadLine();//
									  //var line="wfwf ![enter image description here](https://lh3.googleusercontent.com/jYdh5LNi5_3UzhCpMfx7NgCa3KeKklwsmmJ9bSPf4Tode4CowiVCjW80IMgSBhYgA4YV721slNUWCA) wfwf";
		var matches = Regex.Match(line, @"\((https://[^)]+googleusercontent[^)=]+)[\)=]");
		using (WebClient wc = new WebClient())
		{
			if (matches.Success)
			{

				var val = matches.Groups[1].Value;
				val.Dump();
				var name = new Uri(val).PathAndQuery.TrimStart('/');
				//var path=Path.Combine(@"D:\!\",name)+".jpg";
				wc.DownloadFile(val + "=s10000", name + ".jpg");
			}
		};
	}
	
}

// Define other methods and classes here
