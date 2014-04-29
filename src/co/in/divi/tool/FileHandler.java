package co.in.divi.tool;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.InputStreamReader;

public class FileHandler {

   public String readFile( String fileName ) {

      String data = null;
      try {

         BufferedReader bufferedReader = new BufferedReader( new InputStreamReader( new FileInputStream( fileName ), "UTF-8" ) );

         String readLine = bufferedReader.readLine();
         StringBuffer stringBuffer = new StringBuffer();

         while( readLine != null ) {
            stringBuffer.append( readLine + "\n" );
            readLine = bufferedReader.readLine();
         }

         data = stringBuffer.toString();

      }
      catch( Exception e ) {
         e.printStackTrace();
      }

      return data;
   }

   public String readXML( String fileName ) {

      return readFile( fileName ).trim().replaceFirst( "^([\\W]+)<", "<" );
   }
}
