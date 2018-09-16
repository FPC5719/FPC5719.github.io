var
	fin,fin1,fout:text;
	s:string;
	n,i:longint;
	c:char;
begin
	readln(s);
	assign(fin,s);
	reset(fin);
	readln(s);
	assign(fin2,s);
	reset(fin2);
	readln(s);
	assign(fout,s);
	reset(fout);
	readln(n);
	for i:=1 to n do begin
		
	end;
	close(fin);
	close(fin2);
	close(fout);
end.