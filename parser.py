from PyPDF2 import PdfFileReader
from pathlib import Path

pdf = PdfFileReader('111JUL19-1.pdf')



#Extract The page
page0Object = pdf.getPage(0)
# print(page0Object)

#Extract the Text
page1text = page0Object.extractText()
# print(page1text)


#Combine de text and save as a Text File
with Path('pdfToText.txt').open(mode='w') as output_file:
    text = ''
    for page in pdf.pages:
        text += page.extractText()
        output_file.write(text)

        #Where is the word

        word_pages = []
        Word = 'DOMICILIACIÓN'
        for page in pdf.pages:
            page_num = page['/StructParents']
            page_text = page.extractText()

            if Word in page_text:
                word_pages.append(page_num)


print(word_pages)

