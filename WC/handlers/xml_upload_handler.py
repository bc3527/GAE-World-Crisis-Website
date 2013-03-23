from google.appengine.api import taskqueue
from vendors.minixsv import pyxsval as xsv
from xml.etree.ElementTree import ParseError
import json
import re
import xml.parsers.expat as ET
import webapp2


class IncorrectArticleReferenceException(Exception):
    pass

class XMLUploadHandler(webapp2.RequestHandler):
    
    def checkReferences(self, root):
        idMap = {}
        refs = {}
        for articleGroup in root:
            for article in articleGroup:
                idMap[article.attrib("id")] = 0
                if (article.find('person-refs') != None):
                    tokens = article.find('person-refs').text.split()
                    for token in tokens:
                        refs[token] = 0
                if (article.find('organization-refs') != None):
                    tokens = article.find('organization-refs').text.split()
                    for token in tokens:
                        refs[token] = 0
                if (article.find('crisis-refs') != None):
                    tokens = article.find('crisis-refs').text.split()
                    for token in tokens:
                        refs[token] = 0
        idSet = set(idMap.keys())
        refSet = set(refs.keys())
        diff = idSet.difference(refSet)
        if len(diff) > 0:
            raise IncorrectArticleReferenceException("Unknown references: " + diff)
                        
    def validate_xml(self, xmlfile, xsdfile):
        """
        This method will be used on a server side to validate and process the xml file with 
        an existing xsd schema. If xml is not well-formed or doesn't match the schema, false is returned 
        """        
        try:
            xsdfileText = open(xsdfile, 'r')
            xsdFileInput = xsdfileText.read()
            filteredXMLText = re.sub("&", "&amp;", xmlfile)
            xsv.parseAndValidateString(filteredXMLText, xsdFileInput, xmlIfClass=xsv.XMLIF_ELEMENTTREE)  
            return True
        except xsv.xsvalErrorHandler.XsvalError: 
            return False
        except ET.ExpatError:
            return False         
        except ParseError:
            return False
        except IncorrectArticleReferenceException:
            return False
        
    def post(self):
        results = []
        
        if(self.request.get("password") == "12345"):
            for name, fieldStorage in self.request.POST.items():
                if type(fieldStorage) is unicode:
                    continue
                result = {}
                result['name'] = re.sub(r'^.*\\', '',
                    fieldStorage.filename)
                result['type'] = fieldStorage.type
                
                uploaded_text = fieldStorage.value
                
                if self.validate_xml(uploaded_text, 'wc2.xsd'):
                    task = taskqueue.Task(url='/uploadWorker', params={'params' : uploaded_text})
                    task.add()
                    
                else:
                    result["error"] = "invalid XML";
                    
                results.append(result)
        else:
            results.append({"error" : "wrong password!"})
            
        self.response.headers['Content-Type'] = 'application/json'
        self.response.write(json.dumps(results))
