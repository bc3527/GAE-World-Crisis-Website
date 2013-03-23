import webapp2
from google.appengine.ext import db
from models.person_model import Person
from models.org_model import Organization
from models.crisis_model import Crisis
from handlers.index_handler import IndexHandler
import xml.parsers.expat as ET
import re
from vendors.minixsv import pyxsval as xsv   
from xml.etree.ElementTree import ParseError
import logging

class XMLUploadWorker(webapp2.RequestHandler):
    
    """
    You will need to go to http://www.familieleuthe.de/DownloadMiniXsv.html and download minixsv package,
    follow the instructions on installations, before you run this prog. By default, this package is installed
    in /Library/Frameworks/Python.framework/Versions/2.7/lib/python2.7/site-packages, but I had to add it to 
    project's dir, as it cannot spot the package from Handlers for some reason.
    """
    def isUrlWithDescription(self, keyword):
        """
        Checks if tag with name keyword has a silly source+description pattern
        """
        return keyword == 'external-links' or keyword == 'maps' or keyword == 'images' or keyword == 'citations' 
    
    def simpleInfo(self, keyword):
        """
        Checks if tag named keyword is a simple tag with no children.
        All names in this method are hard coded, because we may have a tag that should contain children
        has no children. E.g. ways-to-help can have zero or more subTags, so we can't just check tag's length
        like we did in the first part of WC, we need consistency for a later successful attribute_dict unpacking
        """
        return keyword == 'name' or keyword == 'alternate-names' or keyword == 'description' or keyword == 'address' \
                or keyword == 'phone' or keyword == 'email' or keyword == 'economic-impact' or keyword == 'kind' or keyword == 'start-date' 
                
        
    def processUrlWithDescription(self, pchild, attribute_dict):
        """
        Processes tags that follow the source-desc pattern. Creates prefixed subtags with populatePrefixedLists method
        """
        for someChild in pchild:
            self.populatePrefixedLists(someChild, attribute_dict)
            
    def handleDepthOneWithNamedChildren(self, pchild, attribute_dict):
        """
        for XML nodes that have children with names to be saved
        """
        for someChild in pchild:
            value = someChild.text
            if ('impact' in pchild.tag):
                value = int(value)
            if (someChild.tag == 'longitude' or someChild.tag == 'latitude'):
                value = float(value)
            attribute_dict[someChild.tag] = value
        
    def handleDepthOneNoNaming(self, pchild, attribute_dict):
        """
        if XML node's child name isn't needed, it populates the list with unnamed child tag values.
        """
        lst = []
        for someChild in pchild:
            value = someChild.text if (someChild.text) else ""
            lst.append(value)
        attribute_dict[re.sub('-','_',pchild.tag)] = lst
    
    def populatePrefixedLists(self, pchild, attribute_dict):
        """
        This method is used to create prefixed entries of model, such as video_youtube vidio_vimeo or social_facebook.
        Prefixing is used to automation of a significant part of XML nodes
        """
        for someChild in pchild:
            prefixedKey = re.sub('-','_',pchild.tag) + '_' + someChild.tag
            value = someChild.text if (someChild.text) else ""
            if ('source' in someChild.tag):
                value = db.Link(someChild.text)
            if (prefixedKey in attribute_dict):
                attribute_dict[prefixedKey].append(value)
            else:
                attribute_dict[prefixedKey] = [value]
    
    def performIndexing(self, indexHandler, someEntity):
        """
        adds an index to article's page, puts a question mark pic if now picture is given in an article
        """
        url = "/article/" + someEntity.key().name()
        image = someEntity.image_source[0] if someEntity.image_source else "http://soutalkuwait.com/nowab/wp-content/uploads/2012/01/Unknown-person1.gif"
        indexHandler.create_document(url, image)
        
    def createModels(self, pagetype):
        """
        Goes through each tag and creates a pair (child.tag : child.text) and puts it in a dictionary.
        We have to make sure that the fields in our Models will be exactly the same as tags in our schema
        Tags with children will create lists of attributes, i.e. [name, URL]. If naming convention changes in XSD schema
        naming of Model properties must be changed as well.
        """
        for childnode in pagetype:
            attribute_dict = {}
            uniqueID = childnode.attrib["id"]
            for pchild in childnode:
        
                if (self.simpleInfo(pchild.tag)):
                    if (pchild.tag == "kind"):
                        attribute_dict["category"] = pchild.text
                    else:
                        try:
                            value = pchild.text
                            if (pchild.tag == 'economic-impact'):
                                value = int(value)
                            if ('-' in pchild.tag):
                                removedHyphens = re.sub("-", "_", pchild.tag)
                                attribute_dict[removedHyphens] = value
                            else:
                                attribute_dict[pchild.tag] = value
                        except UnicodeEncodeError:
                            print pchild.text[:40]
                            return
                else:
                    if (self.isUrlWithDescription(pchild.tag)):
                        self.processUrlWithDescription(pchild, attribute_dict)
                    elif (pchild.tag == "location" or pchild.tag == "human-impact"):
                        self.handleDepthOneWithNamedChildren(pchild, attribute_dict)
                    elif (pchild.tag == "videos" or pchild.tag == "social"):
                        self.populatePrefixedLists(pchild, attribute_dict)
                    elif (pchild.tag == "resources-needed" or pchild.tag == "ways-to-help"):
                        self.handleDepthOneNoNaming(pchild, attribute_dict)
                        
            if (len(pagetype.tag) > 0):
                if (pagetype.tag == "people"):
                    somePerson = Person(key_name=uniqueID, **attribute_dict)
                    somePerson.put()                    
                elif (pagetype.tag == "crises"):
                    someCrisis = Crisis(key_name=uniqueID, **attribute_dict)
                    assert isinstance(someCrisis, Crisis)
                    someCrisis.put()
                else:                   
                    someOrganization = Organization(key_name=uniqueID, **attribute_dict)
                    someOrganization.put()
            
        
    
    # need to refactor this, too redundant! (Azamat) I know! I said that when we were doing it remember! (Ani)        
    def createLinks(self, pagetype, booleanCreateDocs=True):
        """
        This method is a post-createModels procedure. All models in datastore are not linked to each other after createModels.
        createLinks method pulls out model instances, create links to other articles by inserting key references to them and put them back
        in a datastore
        """
        indexHandler = IndexHandler()
        if (pagetype.tag == "people"):
            for childnode in pagetype:
                #print childnode.tag.title()
                #assert False
                
                someEntity = db.get(db.Key.from_path(childnode.tag.title(), childnode.attrib['id']))
                assert isinstance(someEntity, Person)
                orgrefs = childnode.find("organization-refs")
                if (not orgrefs == None):
                    orglinks = orgrefs.text.split()
                    keylinks = map(lambda v: db.Key.from_path("Organization",v), orglinks)
                    someEntity.organization_link = keylinks
                crisisrefs = childnode.find("crisis-refs")
                if (not crisisrefs == None):
                    crislinks = crisisrefs.text.split()
                    keylinks = map(lambda v: db.Key.from_path("Crisis",v), crislinks)
                    someEntity.crisis_link = keylinks
                someEntity.put()
                if (booleanCreateDocs):
                    self.performIndexing(indexHandler, someEntity)                
        elif (pagetype.tag == "organizations"):
            for childnode in pagetype:
                someEntity = db.get(db.Key.from_path(childnode.tag.title(), childnode.attrib['id']))
                assert isinstance(someEntity, Organization)
                personrefs = childnode.find("person-refs")
                if (not personrefs == None):
                    personlinks = personrefs.text.split()
                    keylinks = map(lambda v: db.Key.from_path("Person",v), personlinks)
                    someEntity.person_link = keylinks                
                crisisrefs = childnode.find("crisis-refs")
                if (not crisisrefs == None):
                    crislinks = crisisrefs.text.split()
                    keylinks = map(lambda v: db.Key.from_path("Crisis",v), crislinks)
                    someEntity.crisis_link = keylinks
                someEntity.put()
                if (booleanCreateDocs):
                    self.performIndexing(indexHandler, someEntity) 
        else:
            for childnode in pagetype:
                someEntity = db.get(db.Key.from_path(childnode.tag.title(), childnode.attrib['id']))
                assert isinstance(someEntity, Crisis)
                logging.info("\n\n"+childnode.tag.title() + "\n"  + str(db.Key.from_path(childnode.tag.title(), childnode.attrib['id'])) + "\n" + childnode.attrib['id'] + "\n\n")
                orgrefs = childnode.find("organization-refs")
                if (not (orgrefs == None)):
                    orglinks = orgrefs.text.split()
                    keylinks = map(lambda v: db.Key.from_path("Organization",v), orglinks)
                    someEntity.organization_link = keylinks
                personrefs = childnode.find("person-refs")
                if (not (personrefs == None)):
                    personlinks = personrefs.text.split()
                    keylinks = map(lambda v: db.Key.from_path("Person",v), personlinks)
                    someEntity.person_link = keylinks
                someEntity.put()
                if (booleanCreateDocs):
                    self.performIndexing(indexHandler, someEntity) 
    
    def validate_xml(self, xmlfile, xsdfile, booleanCreateDocs = True):
        """
        This method will be used on a server side to validate and process the xml file with 
        an existing xsd schema. If xml is not well-formed or doesn't match the schema, false is returned 
        """        
        try:
            xsdfileText = open(xsdfile, 'r')
            xsdFileInput = xsdfileText.read()
            filteredXMLText = re.sub("&", "&amp;", xmlfile)
            xmleval = xsv.parseAndValidateString(filteredXMLText, xsdFileInput, xmlIfClass=xsv.XMLIF_ELEMENTTREE)
            etree = xmleval.getTree()
            root = etree.getroot()
            havePeople = root.find("people") != None
            haveCrises = root.find("crises") != None
            haveOrgs = root.find("organizations") != None  
            if (haveOrgs):    
                self.createModels(root.find("organizations"))  
            if (havePeople):
                self.createModels(root.find("people"))  
            if (haveCrises):              
                self.createModels(root.find("crises"))
                
            if (havePeople):
                self.createLinks(root.find("people"), booleanCreateDocs)    
            if (haveOrgs):    
                self.createLinks(root.find("organizations"), booleanCreateDocs)  
            if (haveCrises):              
                self.createLinks(root.find("crises"), booleanCreateDocs)
                
            return True
        except xsv.xsvalErrorHandler.XsvalError: 
            return False
        except ET.ExpatError:
            return False         
        except ParseError:
            return False
        
    def post(self): # should run at most 1/s
        upload_file_text = self.request.get('params')
        assert len(upload_file_text) > 0
        upload_file_text = upload_file_text.encode('ascii','ignore')
        validXML = self.validate_xml(upload_file_text, 'wc2.xsd')
        if (validXML):
            logging.info("\n\n\nXML is valid, models are created and stored in DataStore\n\n\n")
            self.response.write("XML is valid, models are created and stored in DataStore")
        else:
            logging.info("\n\n\nNot well-formed XML or no match with the schema or not an XML file\n\n\n")
            self.response.write("Not well-formed XML or no match with the schema or not an XML file")
    