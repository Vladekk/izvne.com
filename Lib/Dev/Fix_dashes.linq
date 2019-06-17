<Query Kind="Statements" />

var term = "Черногория";
var posts = Directory.GetFiles(@"C:\STONE\Docs\Source\izvne.com\Izvne.com\input\post", $"*{term}*.*", SearchOption.AllDirectories);
var was = $@"{term} — (\d+) —"; 
var @new = $"{term} — $1,";
	//1 - Дорога к Лапсеке 
	posts.Dump();
	foreach(var file in posts){
		var text=File.ReadAllText(file);
		//text.Dump();
		text=Regex.Replace(text,was,@new);
		text.Dump();
		File.WriteAllText(file,text);
		File.Move(file,Regex.Replace(file,was,@new));
	}