from google.appengine.api import search
from handlers.image_compression import compress
import webapp2
import json

_INDEX_NAME = 'website_content'

class SearchHandler(webapp2.RequestHandler):
    def get(self):
        # text to search
        text = self.request.get("search")
        index = search.Index(name=_INDEX_NAME)
        
        # Set sort options
        sort = search.SortOptions(match_scorer=search.MatchScorer())
        
        # Set query options
        options = search.QueryOptions(
            sort_options=sort,
            returned_fields=['content_of_article', 'article_url', 'image_url'],
            snippeted_fields=['content_of_article'])

        # define query boolean options
        q_list = self.generate_query(text)
        result = []
        doc_id_list =[]
        
        for q in q_list:
            query_obj = search.Query(query_string=q, options=options)
            results = index.search(query_obj)

            for doc in results:
                # check if the doc is already in display results
                if (str(doc.doc_id) in doc_id_list) == False:
                    result.append({
                        "snippet":str(doc.expressions[0].value),
                        "url":  str(doc.fields[1].value),
                        "image": compress(doc.fields[2].value, 70, 70)
                        })
                    doc_id_list.append(str(doc.doc_id))

                  
  
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(result))
        
    def generate_query(self, text):
        str_list = text.split()
        q_list = []
        q_list.append(text)
        if len(str_list) > 1:
            result_str = " OR ".join(my_str for my_str in str_list) # eg. A or B or C
            q_list.append(result_str)
        
        return q_list