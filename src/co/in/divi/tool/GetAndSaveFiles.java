package co.in.divi.tool;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URL;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class GetAndSaveFiles extends HttpServlet {
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
	        throws ServletException, IOException
	    {
	        String path = req.getParameter("filepath");
	        PrintWriter out = resp.getWriter();
	        URL url = new File(path).getAbsoluteFile().toURI().toURL();
	        out.println(url);
	    }
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException
    {
        String path = req.getParameter("filepath");
        String content = req.getParameter("content");
//EXAMPLE:
        //filepath=absolute file path to save(with bookpath/chapter/topic etc
        //content = contents of file (masterjson/topic-content.xml)
        //filepath="/var/www/daerty/1/2/topic-content.xml"
        //content = "<xml></xml>"
        File theDir = new File(path);
        PrintWriter out = resp.getWriter();
  //check if directory exists
        File directory = new File(theDir.getParentFile().getAbsolutePath());
        boolean result;
        if(directory.isDirectory())
        {
        	//i.e. if root directory exists it is safe to assume that path is good.
        	BufferedWriter writer = null;
        	try
        	{
        	    writer = new BufferedWriter( new FileWriter(path));
        	    writer.write(content);

        	}
        	catch ( IOException e)
        	{
        	}
        	finally
        	{
        	    try
        	    {
        	        if ( writer != null)
        	        writer.close( );
        	        out.println(true);
        	    }
        	    catch ( IOException e)
        	    {
        	    }
        	}
        }
        
    }
}
