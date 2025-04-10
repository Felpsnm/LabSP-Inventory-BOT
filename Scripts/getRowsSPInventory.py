import pandas as pd
import sys
from tabulate import tabulate

#Obtém os argumentos da Linha de Comando e guarda em váriaveis
column = sys.argv[1]
query = sys.argv[2]


#Armazena linha a ser adicionada
search_params = [column, query]

#Armazena o caminho do arquivo
file_path = r'C:\Users\felipema\OneDrive - Cisco\Desktop\Inventário Lab SP - 2024 OFICIAL.xlsx'

#Lê o Excel
df = pd.read_excel(file_path, header=7, sheet_name="Geral")

df = df.iloc[:, 1:6]

df = df.astype(str)

search_resul = df.loc[df[column].str.contains(query)]

table = tabulate(search_resul, headers='keys', tablefmt='pipe', showindex=False)

print(table)
