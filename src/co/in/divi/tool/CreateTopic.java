package co.in.divi.tool;

import java.io.*;
import java.net.URL;

import javax.servlet.*;
import javax.servlet.http.*;

public class CreateTopic extends HttpServlet
{
//GET sends topic-content.xml POST creates a new topic and sets-up topic-content.xml and media folder
// GET implemented based on earlier understanding. May remove it if not required.	
// same could be fetched from GetAndSaveFiles
	protected void doGet(HttpServletRequest req, HttpServletResponse resp)
	        throws ServletException, IOException
	    {
	        String path = req.getParameter("currentpath");
	        String topicid = req.getParameter("topicid");
	        PrintWriter out = resp.getWriter();
	        URL url = new File(path+"/"+topicid+"/topic-content.xml").getAbsoluteFile().toURI().toURL();
	        out.println(url);
	    }
	protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException
    {
        String path = req.getParameter("currentpath");
        String topicid = req.getParameter("topicid");
        String dirLoc = path+"/"+topicid;
        //Need to create 2 directories chapter/topic and chapter/topic/media and a file chapter/topic/topic-content.xml
        File theDir = new File(dirLoc);
        PrintWriter out = resp.getWriter();
        // if the directory does not exist, create it
        if (!theDir.exists()) {
          boolean result = theDir.mkdir();  
          	if(result) {    
          	 theDir = new File(dirLoc+"/media");
          	 theDir.mkdir();
           	 File theFile = new File(dirLoc+"/topic-content.xml");
           	 result = theFile.createNewFile();
           	 out.println("true");  
           }
        }
    }
}