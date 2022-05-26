


import re
import pdfplumber
# import pandas as pd
from collections import namedtuple
import openpyxl
import sys
import json 

 

excel = openpyxl.load_workbook(filename = './Plantillas modelos impuestos UHY.xlsx')




# nameOfTheFile =s
# nameOfTheFile =  data['name']

# print(modelForm)
# print(nameOfTheFile)




monthRegex = re.compile(r"(0?[1-9]|[1][0-2])$")
month = ''
lines = []
total_check = 0
cuotas = 0
bases = 0



def model111IRPF(file):

   sheet1 = excel['IRPF 111']
   monthRegex = re.compile(r"(0?[1-9]|[1][0-2])$")
   month = ''
   with pdfplumber.open(file) as pdf:
       pages = pdf.pages
       for page in pdf.pages:
           text = page.extract_text()
           for line in text.split('\n') :
               #print(line.split())
               if(line.find('Período') != -1):
                   month = int(monthRegex.search(line).group(1)) + 3
                   items = line.split()
                   print(month)
                   print(items)


               elif((line.startswith('Rendimientos dinerarios')) & (line.find('01')  != -1)): 
                   items = line.split()

                   perceptores = float(items[4].replace(".","").replace(",","."))
                   percepciones = float(items[6].replace(".","").replace(",","."))
                   retenciones = float(items[8].replace(".","").replace(",","."))
                   sheet1.cell(column= month,row=8, value = perceptores)
                   sheet1.cell(column= month,row=9, value = percepciones)
                   sheet1.cell(column= month,row=10, value = retenciones)
               elif((line.startswith('Rendimientos en especie')) & (line.find('04')  != -1)):
                   #TODO
                   items = line.split()

               elif((line.startswith('Rendimientos dinerarios')) & (line.find('07')  != -1)): 
                   items = line.split()
                   print(items)
                   perceptores = float(items[4].replace(".","").replace(",","."))
                   percepciones = float(items[6].replace(".","").replace(",","."))
                   retenciones = float(items[8].replace(".","").replace(",","."))
                   sheet1.cell(column= month,row=20, value = perceptores)
                   sheet1.cell(column= month,row=21, value = percepciones)
                   sheet1.cell(column= month,row=22, value = retenciones)
               elif((line.startswith('Rendimientos en especie')) & (line.find('10')  != -1)):
                   #TODO
                   items = line.split()
               elif((line.startswith('Premios en metálico')) & (line.find('13')  != -1)):
                   #TODO
                   items = line.split()
               elif((line.startswith('Premios en especie')) & (line.find('16')  != -1)):
                   #TODO
                   items = line.split() 
               elif((line.startswith('Percepciones dinerarias')) & (line.find('19')  != -1)):
                   #TODO
                   items = line.split()
               elif((line.startswith('Percepciones en especie')) & (line.find('22')  != -1)):
                   #TODO
                   items = line.split()
               elif((line.startswith('Contraprestaciones dinerarias o en especie')) & (line.find('25')  != -1)):
                   #TODO
                   items = line.split()
               elif((line.startswith('Total liquidación')) & (line.find('25')  != -1)):
                   #TODO
                   items = line.split()
               
              
   


def model303Iva(file):
   sheet1 = excel['IVA']
   with pdfplumber.open(file) as pdf:
    pages = pdf.pages
    for page in pdf.pages:
        text = page.extract_text()
        for line in text.split('\n'):            
            if(line.find('Ejercicio ') != -1):
                month = int(monthRegex.search(line).group(1)) + 4
                
                #print(month) 
                
            ## TODO ELFI TIPO 4 %    
            # 10%
            elif((line.startswith('Régimen general')) & (line.find('04')  != -1)): 
                items = line.split()
                #print(items)
                bases = float(items[4].replace(".","").replace(",","."))
                cuotas = float(items[8].replace(".","").replace(",",".")) 
                sheet1.cell(column= month,row=8, value = bases)
                sheet1.cell(column= month,row=20, value = cuotas)
               #  lines.append(tipo10PorCiento(items[4]))
                   
                items = line.split()
             # 21%   
            elif(line.startswith('07')  ):
              
                items = line.split()
                #print(items)
                bases = float(items[1].replace(".","").replace(",","."))               
                cuotas = float( items[5].replace(".","").replace(",","."))
                sheet1.cell(column= month,row=9, value = bases)
                sheet1.cell(column= month,row=21, value = cuotas)
                
            # Adquisiciones intracomunitarias de bienes y servicios.
            elif(line.startswith('Adquisiciones intracomunitarias de bienes y servicios.')  ):
                items = line.split()
                #print(items)
                bases = float(items[8].replace(".","").replace(",","."))  
                cuotas = float( items[10].replace(".","").replace(",","."))
                sheet1.cell(column= month,row=22, value = cuotas)
                sheet1.cell(column= month,row=10, value = bases)
                
            # TODO ELIF Otras operaciones con inversión del sujeto pasivo'
            elif(line.startswith('Otras operaciones con inversión del sujeto pasivo')  ):
                items = line.split()
                # print(items)
                #    value = items[10]
                #  sheet1.cell(column= month,row=11, value = value)  
            
            # Modificación bases y cuotas
            elif((line.find('bases y cuotas') != -1 ) & (line.find('14') != -1  )):
               items = line.split()
               #print(items)
               cuotas = float( items[9].replace(".","").replace(",","."))               
               bases = float(items[7].replace(".","").replace(",","."))               
               sheet1.cell(column= month,row=12, value = bases)
               sheet1.cell(column= month,row=24, value = cuotas)
                
              # TODO ELIF Recargo equivalencia
              # TODO Modifi caciones bases y cuotas del recargo de equivalencia 
            elif(line.startswith('Por cuotas soportadas en operaciones interiores corrientes')):
               items = line.split()
               
               cuotas = float( items[11].replace(".","").replace(",","."))
               bases = float(items[9].replace(".","").replace(",","."))      
               sheet1.cell(column= month,row=31, value = bases)
               sheet1.cell(column= month,row=41, value = cuotas)
            elif(line.startswith('Por cuotas soportadas en operaciones interiores con bienes de inversión')):
               items = line.split()
              
               cuotas = float( items[14].replace(".","").replace(",","."))
               bases = float(items[12].replace(".","").replace(",","."))
               sheet1.cell(column= month,row=32, value = bases)
               sheet1.cell(column= month,row=42, value = cuotas)      
             
            # TODO ELIF Por cuotas soportadas en las importaciones de bienes corrientes
            # TODO Por cuotas soportadas en las importaciones de bienes de inversión
            
            elif(line.startswith('En adquisiciones intracomunitarias de bienes y servicios corrientes')):
               items = line.split()
               # print(items)
               cuotas = float( items[12].replace(".","").replace(",","."))
               bases = float(items[10].replace(".","").replace(",","."))
               sheet1.cell(column= month,row=35, value = bases)
               sheet1.cell(column= month,row=45, value = cuotas)
                
               # TODO En adquisiciones intracomunitarias de bienes de inversión 
            
            elif((line.find('40') != -1 ) & (line.find('41') != -1  )):
               items = line.split()               
               cuotas = float(items[8].replace(".","").replace(",","."))
               bases = float(items[6].replace(".","").replace(",","."))
               sheet1.cell(column= month,row=37, value = bases)
               sheet1.cell(column= month,row=47, value = cuotas)   
            
         
            #TODO ELIF Compensaciones Régimen Especial A.G. y P.
            #TODO ELIF Regularización bienes de inversión
            #TODO ELIF Regularización por aplicación del porcentaje definitivo de prorrata
            #TODO ELIF Entregas intracomunitarias de bienes y servicios
            
            elif(line.startswith('Exportaciones y operaciones asimiladas')):
               items = line.split()                        
               sheet1.cell(column= month,row=61, value = float(items[6].replace(".","").replace(",",".")))
           
            elif((line.find('61') != -1 ) & (line.find('Operaciones') != -1 ) ):
               items = line.split()
               print(items)               
               sheet1.cell(column= month,row=62, value = float(items[17].replace(".","").replace(",",".")))
           
            
            #TODO ELIF Importes de las entregas de bienes y prestaciones de servicios...
            #TODO ELIF Importes de las adquisiciones de bienes y servicios a las que sea de aplicación
            
            
           # RESULTADO
        
           #TODO ELIF Regularización cuotas art. 80.Cinco.5ª LIVA  
           #TODO ELIF Suma de resultados ( [46] + [58] + [76] ) 
        
           #TODO ELIF Atribuible a la Administración del Estado ( [46] + [58] + [76] )
            elif((line.find('66') != -1 ) & (line.find('65') != -1 ) ):
                items = line.split()
                print(items)               
                sheet1.cell(column= month,row=57, value = float(items[9].replace(".","").replace(",",".")))           
        
            #excel.save('Plantillas modelos impuestos UHY.xlsx')



def getDataFromPdfAndSaveExcel():
    data = json.loads(sys.stdin.readline())
    print(data)
    sys.stdout.flush()
    modelForm = data['type']   
    for name in data['names']:
        print(name)
        file = './uploads/'+ name
        if(modelForm == "303"):
           print('pasa 303')
           model303Iva(file)
           excel.save('Plantillas modelos impuestos UHY.xlsx')
         
        elif(modelForm == "111"):
           print('pasa 111')
           model111IRPF(file)
           excel.save('Plantillas modelos impuestos UHY.xlsx')
           

getDataFromPdfAndSaveExcel()


