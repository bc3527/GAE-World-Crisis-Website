from handlers.about_us_handler import AboutUsHandler
from handlers.articleHandler import ArticleHandler
from handlers.article_list_handler import ArticleListHandler
from handlers.data_flush_handler import DataFlushHandler
from handlers.export_handler import ExportHandler
from handlers.image_handler import ImageHandler
from handlers.main_handler import MainHandler
from handlers.search_handler import SearchHandler
from handlers.xml_upload_handler import XMLUploadHandler
from handlers.xml_upload_worker import XMLUploadWorker
import webapp2

app = webapp2.WSGIApplication([
    ('/data/article/(.+)', ArticleHandler),
    ('/data/search', SearchHandler),
    ('/data/(\w+)', ArticleListHandler),
    ('/flush.*', DataFlushHandler),
    ('/upload', XMLUploadHandler),
    ('/compressed_img?.+', ImageHandler),
    ('/export', ExportHandler),
    ('/about', AboutUsHandler),
    ('/search', SearchHandler),
    ('/uploadWorker', XMLUploadWorker),
    (r'/.*',MainHandler)
], debug=True)
