from google.appengine.api import search, urlfetch
from google.appengine.ext import webapp
import logging

#index_handler should create the document and put it to index
_INDEX_NAME = 'website_content'
 
class IndexHandler(webapp.RequestHandler):

    def create_document(self,url, image_url) :
        #fetch text from given url
        r = urlfetch.fetch("http://www.ulan90-cs373-wc.appspot.com/data" + url)
        result_str = r.content

        doc = search.Document(doc_id = url,
            fields = [search.HtmlField (name='content_of_article', value=result_str), 
                      search.TextField (name= 'article_url', value =url),
                      search.TextField (name= 'image_url', value =image_url)]
            )
            
        try :
            search.Index(name= _INDEX_NAME).put(doc)
        except search.Error:
            logging.exception('Index Failed')
        '''    
        return doc
        '''    
    def removeAllDocuments(self):
        doc_index = search.Index(name=_INDEX_NAME)

        while True:
            # Get a list of documents populating only the doc_id field and extract the ids.
            document_ids = [document.doc_id
                            for document in doc_index.list_documents(ids_only=True)]
            if not document_ids:
                break
            # Remove the documents for the given ids from the Index.
            doc_index.remove(document_ids)