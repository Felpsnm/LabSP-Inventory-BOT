from openpyxl import load_workbook
import sys

#Obtém os argumentos da Linha de Comando e guarda em váriaveis
produto = sys.argv[1]
serial = sys.argv[2]
tag_ativo = sys.argv[3]
pn = sys.argv[4]
rack = sys.argv[5]

#Armazena linha a ser adicionada
new_row = ["", produto, serial, tag_ativo, pn, rack]

#Armazena os caminhos de arquivos
file_path = r'C:\Users\felipema\OneDrive - Cisco\Desktop\Inventário Lab SP - 2024 OFICIAL.xlsx'
final_file_path = r'C:\Users\felipema\OneDrive - Cisco\Desktop\Inventário Lab SP - 2024 OFICIAL-EDITADO.xlsx'

#Lê o Excel
workbook = load_workbook(file_path)

#Adiciona nova linha no final do arquivo
workbook['Geral'].append(new_row)

#Salva o arquivo
workbook.save(final_file_path)