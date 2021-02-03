import sublime
import sublime_plugin
import os

import shutil, errno

def copyanything(src, dst):
    try:
        shutil.copytree(src, dst)
    except OSError as exc: # python >2.5
        if exc.errno == errno.ENOTDIR:
            shutil.copy(src, dst)
        else: raise

class CreateStoreRedoxCommand(sublime_plugin.WindowCommand):
    def get_path(self, paths):
        if paths:
            return paths[0]
        # DEV: On ST3, there is always an active view.
        #   Be sure to check that it's a file with a path (not temporary view)
        elif self.window.active_view() and self.window.active_view().file_name():
            return self.window.active_view().file_name()
        elif self.window.folders():
            return self.window.folders()[0]
        else:
            sublime.error_message('Terminal: No place to open terminal to')
            return False
            
    def run(self, paths=[]):
        path = self.get_path(paths)
        if not path:
            return

        if os.path.isfile(path):
            path = os.path.dirname(path)

        delim = os.path.sep

        fileToCreate = '{}{}store.js'.format(path, delim)
        if not os.path.exists(fileToCreate):
            self.create_store(fileToCreate)

    def create_store(self, fileToCreate):
        me = os.path.dirname(os.path.realpath(__file__))
        delim = os.path.sep
        fileToCopy = '{}{}store.js'.format(me, delim)
        copyanything(fileToCopy, fileToCreate)

        
class CreateDirRedoxCommand(sublime_plugin.WindowCommand):
    def get_path(self, paths):
        if paths:
            return paths[0]
        # DEV: On ST3, there is always an active view.
        #   Be sure to check that it's a file with a path (not temporary view)
        elif self.window.active_view() and self.window.active_view().file_name():
            return self.window.active_view().file_name()
        elif self.window.folders():
            return self.window.folders()[0]
        else:
            sublime.error_message('Terminal: No place to open terminal to')
            return False

    def run(self, paths=[]):
        path = self.get_path(paths)
        if not path:
            return

        if os.path.isfile(path):
            path = os.path.dirname(path)

        self.path = path
        self.search_input()
    
    def search_input(self):
        self.window.show_input_panel("Redox Feature name: ", '', self.run_search, None, None)

    def run_search(self, text):
        # print("text", text.strip())
        if text.strip():
            delim = os.path.sep
            textFormatted = ' '.join(text.strip().split()).replace(" ","_").replace("-","_")
            dirToCreate = "{}{}{}".format(self.path, delim, textFormatted)
            if not os.path.isdir(dirToCreate):
                self.create_dir(dirToCreate, textFormatted)

    def replace_pattern(self, text, filename):
        # Read in the file
        with open('{}'.format(filename), 'r') as file :
          filedata = file.read()

        # Replace the target string
        filedata = filedata.replace('{{SLICE_NAME}}', text)
        
        # Write the file out again
        with open('{}'.format(filename), 'w') as file:
          file.write(filedata)

    def create_dir(self, dirToCreate, text):
        me = os.path.dirname(os.path.realpath(__file__))
        delim = os.path.sep
        fromDir = "{}{}feature_template".format(me, delim)
        # print("create {} => {} ".format(fromDir, dirToCreate))
        copyanything(fromDir, dirToCreate)
        self.replace_pattern(text, '{}{}slice.js'.format(dirToCreate, delim))
        self.replace_pattern(text, '{}{}index.js'.format(dirToCreate, delim))

