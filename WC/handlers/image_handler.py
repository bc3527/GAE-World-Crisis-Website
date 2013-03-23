from __future__ import with_statement
from google.appengine.api import files, urlfetch, images
from models.image import Image
import webapp2

class ImageHandler(webapp2.RequestHandler):
    def get(self): 
        #get the original image data
        url = self.request.get("url").replace(" ", "%20")
        w = int(self.request.get("w"))
        h = int(self.request.get("h"))
        
        blob_key = ""
        image_entry = Image.gql("WHERE url = :1",url).get()
        
        if(not image_entry):
            # Create the file
            file_name = files.blobstore.create(mime_type='image/png')
    
            #retrieve
            img_file = urlfetch.fetch(url=str(url), deadline=15).content
            
            # Open the file and write to it
            with files.open(file_name, 'a') as f:
                f.write(img_file)
            
            # Finalize the file. Do this before attempting to read it.
            files.finalize(file_name)
            
            # Get the file's blob key
            blob_key = files.blobstore.get_blob_key(file_name)
            i = Image(url = url, blob_key=str(blob_key))
            i.put()
        else:
            blob_key = image_entry.blob_key
        
        #resize the image
        img = images.Image(blob_key=blob_key)
        img.resize(width=w, height=h, crop_to_fit = True)
        thumbnail = img.execute_transforms(output_encoding = images.PNG)
            
        #produce result
        self.response.headers['Content-Type'] = 'image/png'
        self.response.out.write(thumbnail)