package co.in.divi.tool;

import java.io.*;
import java.net.URL;

import javax.servlet.*;
import javax.servlet.http.*;

public class CreateChapter extends HttpServlet
{
//only POST method to create a new chapter, no get reqd
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
        throws ServletException, IOException
    {
        String path = req.getParameter("currentpath");
        String chapterid = req.getParameter("chapterid");
        String dirLoc = path+"/"+chapterid;
        File theDir = new File(dirLoc);
        PrintWriter out = resp.getWriter();
        // if the directory does not exist, create it
        if (!theDir.exists()) {
          boolean result = theDir.mkdir();  
          	if(result) {    
             out.println("true");  
           }
        }
    }
}