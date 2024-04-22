import psycopg2
import requests

def obter_dados_da_api():
    response = requests.get('http://localhost:5000/operacoes')
    return response.json()

def dado_existe_no_banco(cursor, id_json):
    cursor.execute("SELECT COUNT(*) FROM fatoOperacoes WHERE id_json = %s", (id_json,))
    return cursor.fetchone()[0] > 0

def inserir_dados_no_banco_de_dados(dados):
    conn = psycopg2.connect(
        dbname='robocop',
        user='postgres',
        password='development',
        host='192.168.176.19'
    )
    cursor = conn.cursor()
    
    for dado in dados:
        if not dado_existe_no_banco(cursor, dado['id']):
            cursor.execute("INSERT INTO fatoOperacoes (tipo_operacao, forma_operacao, uf, floresta, data_operacao, frota, operador, turno, horimetro_inicial, horimetro_final, servico_realizado,rendimento,usuario, id_json) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,%s)", 
                           (dado['tipoOperacao'], dado['formaOperacao'], dado['uf'], dado['floresta'], dado['data'], dado['frota'], dado['operador'], dado['turno'], dado['hi'], dado['hf'], dado['sf'], dado['rendimento'], dado['matricula'], dado['id']))
    
    conn.commit()
    cursor.close()
    conn.close()

dados_da_api = obter_dados_da_api()
inserir_dados_no_banco_de_dados(dados_da_api)
