<Query Kind="Statements" />

	var posts=Directory.GetFiles(@"C:\STONE\Docs\Source\izvne.com\Izvne.com\input\post","*Крит*.cshtml");
	var was="Крит – ";
	var @new="Крит — ";
	foreach(var file in posts){
		var text=File.ReadAllText(file);
		
		text.Replace(was,@new);
		File.WriteAllText(file,text);
		File.Move(file,file.Replace(was,@new));
	}