package co.in.divi.tool;

import java.io.*;
import java.net.URL;

import javax.servlet.*;
import javax.servlet.http.*;
public class UploadFile extends HttpServlet
{
	
	protected void doPost(HttpServletRequest req,
        HttpServletResponse res)
        throws ServletException, IOException {
			String source = req.getParameter("sourcepath");
			String dest= req.getParameter("filepath");
//		EXAMPLE: 
			//source is upload path
			//destination is absolute destination path with file name appended
//			source="/var/www/daerty/db.php";
//			dest="/var/www/daerty/drttest/db.php";
			File s = new File(source);
			File d = new File(dest);
			s.renameTo(d);
			}
}