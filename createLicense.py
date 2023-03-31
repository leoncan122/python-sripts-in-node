from docxtpl import DocxTemplate

doc = DocxTemplate("./LicensePlantilla.docx")
context = { "license" : "World company" }
doc.render(context)
doc.save("./docx/generated_doc.docx")
