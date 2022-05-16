#!/usr/bin/env python
# coding: utf-8

# In[300]:


import re
import pdfplumber
import pandas as pd
from collections import namedtuple
import openpyxl

# In[301]:


tipo10PorCiento = namedtuple('Line', 'Base')
excel = openpyxl.load_workbook('./Plantillas modelos impuestos UHY.xls')
sheet1 = excel['IVA']


# In[302]:


#registro = re.compile()


# In[303]:


tipo10PorCiento(* '1 539.49 878121.61 1523.96 - -44504.79 1 1 -'.split())


# In[304]:


file = './303 2019 07.pdf'
monthRegex = re.compile(r"(0?[1-9]|[1][0-2])$")


# In[305]:


lines = []
total_check = 0

with pdfplumber.open(file) as pdf:
    pages = pdf.pages
    for page in pdf.pages:
        text = page.extract_text()
        for line in text.split('\n') :
            if(line.find('Ejercicio ') != -1):
                month = monthRegex.search(line).group(1)
                print(month) 
            elif line.startswith('Régimen general'):                 
                if(line.startswith('04')  != -1):
                    items = line.split()
                    print(line)   
                    items = line.split()
           # print(items)   
           # lines.append(Line(*items))           
           # total_check += tot


# In[293]:


lines
df = pd.DataFrame(lines)
df.head()
sheet1.cell(column= month,row=8) = julio
excel.save('Plantillas modelos impuestos UHY.xls')


# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:





# In[ ]:




