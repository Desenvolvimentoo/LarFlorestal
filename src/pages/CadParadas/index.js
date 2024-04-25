import React, { useState, useCallback} from 'react';
import voltar from './img/voltar.png';

const CadParadas = () => {
    const [paradas, setOperacoes] = useState({
        tipoOperacao: '',
        formaOperacao: '',
        uf: '',
        floresta: '',
        data: '',
        frota: '',
        operador: '',
        turno: '',
        hi: '',
        hf: '',
        motivo:'',
        observacao:''
    });
    const [servicoRealizadoOptions, setServicoRealizadoOptions] = useState([]);
    const matricula = localStorage.getItem('matricula')
    const [idOperacao, setIdOperacao] = useState('');

    const fetchOperacaoData = (id) => {
    const backendEndpoint = `https://api-florestal.vercel.app/operacoes/${id}`;


    fetch(backendEndpoint)
        .then((resp) => {
            if (resp.ok) {
                return resp.json();
            } else {
                alert("Id da operação não encontrado")
                throw new Error('Erro ao buscar dados da operação');
            }
        })
        .then((data) => {
            setOperacoes((prevState) => ({
                ...prevState,
                tipoOperacao: data.tipoOperacao,
                formaOperacao: data.formaOperacao,
                uf: data.uf,
                floresta: data.floresta,
                frota: data.frota,
                operador: data.operador,
                turno: data.turno,
            }));
        })
        .catch((err) => {
            console.error(err);
        });
    };


    const saveOfflineData = async (data) => {
    try {
        const db = await openIndexedDB();
        const transaction = db.transaction("paradasOffline", "readwrite");
        const store = transaction.objectStore("paradasOffline");
        store.add(data);

        transaction.oncomplete = () => {
        alert("Dados salvos no IndexedDB. Eles serão enviados quando houver conexão com a internet.");
        clearOptionsAndShowMessage();
        };

        transaction.onerror = (event) => {
        console.error("Erro ao salvar dados no IndexedDB:", event.target.error);
        };
    } catch (error) {
        console.error("Erro ao acessar IndexedDB:", error);
    }
    };

    const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open("ParadasDB", 1);

        request.onerror = (event) => {
        console.error("Erro ao abrir IndexedDB:", event.target.error);
        reject(event.target.error);
        };

        request.onsuccess = (event) => {
        resolve(event.target.result);
        };

        request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("paradasOffline")) {
            db.createObjectStore("paradasOffline", { autoIncrement: true });
        }
        };
    });
    };

const syncOfflineData = async () => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction("paradasOffline", "readonly");
    const store = transaction.objectStore("paradasOffline");

    const offlineData = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => reject(event.target.error);
    });

        if (offlineData.length > 0) {
        const backendEndpoint = 'https://api-florestal.vercel.app/paradas';
        const syncRequests = offlineData.map((data) => {
            return fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            })
            .then((resp) => {
            if (resp.ok) {
                return data;
            }
            })
            .catch((err) => {
            console.error("Erro ao enviar dados salvos offline:", err);
            });
        });

        const successfulSyncs = await Promise.all(syncRequests);
        const transactionWrite = db.transaction("paradasOffline", "readwrite");
        const storeWrite = transactionWrite.objectStore("paradasOffline");

        successfulSyncs.forEach((data) => {
            const request = storeWrite.delete(data.id);
            request.onerror = (event) => {
            console.error("Erro ao deletar dados do IndexedDB:", event.target.error);
            };
        });

        transactionWrite.oncomplete = () => {
            console.log("Sincronização com o servidor concluída e dados removidos do IndexedDB.");
        };
        }
    } catch (error) {
        console.error("Erro ao sincronizar dados do IndexedDB:", error);
    }
    };


    const checkInternetConnection = () => {
            setInterval(() => {
                if (navigator.onLine) {
                    
                    syncOfflineData();
                }
            }, 5000);
        };

    const createPost = (paradas) => {
        const paradasComMatricula = { ...paradas, matricula: matricula };
        const backendEndpoint = 'https://api-florestal.vercel.app/paradas';
        fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paradasComMatricula),
        })
        .then((resp) => {
            if (resp.ok) {
                const offlineData = JSON.parse(localStorage.getItem('paradasOffline')) || [];
                const updatedOfflineData = offlineData.filter((data) => data !== paradas); 
                localStorage.setItem('paradasOffline', JSON.stringify(updatedOfflineData));
            }
            return resp.json();
        })
        .then((data) => {
            console.log(data);
            clearOptionsAndShowMessage();
        })
        .catch((err) => {
            console.log(err);
            saveOfflineData(paradas); 
        });
    };

    const clearOptionsAndShowMessage = useCallback(() => {
        setOperacoes({
            tipoOperacao: '',
            formaOperacao: '',
            uf: '',
            floresta: '',
            data: '',
            frota: '',
            operador: '',
            turno: '',
            hi: '',
            hf: '',
            motivo:'',
            observacao:''
        });
        setServicoRealizadoOptions([]);
        alert("Operação cadastrada com sucesso");
    }, [setOperacoes, setServicoRealizadoOptions]);

 const handleSubmit = (event) => {
        event.preventDefault();
        if (
            paradas.tipoOperacao &&
            paradas.formaOperacao &&
            paradas.data &&
            paradas.frota &&
            paradas.operador &&
            paradas.turno &&
            paradas.hi &&
            paradas.hf &&
            paradas.motivo 
        ) {
            if (paradas.motivo !== "Selecionar"){
                 if (navigator.onLine) {
                createPost(paradas);
                } else {
                    saveOfflineData(paradas);
                }
                clearOptionsAndShowMessage();
            }
        } else {
            alert("Por favor, preencha todos os campos.");
        }
    };

     checkInternetConnection();


    const handleTipoOperacaoChange = (event) => {
        const { value } = event.target;
        setOperacoes(prevState => ({
            ...prevState,
            tipoOperacao: value
        }));
        updateServicoRealizadoOptions(value, paradas.formaOperacao);
    };

    const handleFormaOperacaoChange = (event) => {
        const { value } = event.target;
        setOperacoes(prevState => ({
            ...prevState,
            formaOperacao: value
        }));
        updateServicoRealizadoOptions(paradas.tipoOperacao, value);
    };

    const updateServicoRealizadoOptions = (tipoOperacao, formaOperacao) => {
        if (tipoOperacao === 'silvicultura') {
            if (formaOperacao === 'manual') {
                setServicoRealizadoOptions(['Selecionar','Chuva', 'Refeição', 'Outro']);
            } else if (formaOperacao === 'mecanizada') {
                setServicoRealizadoOptions(['Selecionar','Lubrificação', 'Hidráulica', 'Borracharia', 'Mecânica', 'Abastecer', 'Chuva', 'Outro']);
            }
        } else if (tipoOperacao === 'colheita') {
            if (formaOperacao === 'manual') {
                setServicoRealizadoOptions([]);
            } else if (formaOperacao === 'mecanizada') {
                setServicoRealizadoOptions(['Selecionar','Lubrificação', 'Hidráulica', 'Borracharia', 'Mecânica', 'Abastecer', 'Chuva','Refeição','Outro']);
            }
        } else {
            setServicoRealizadoOptions([]);
        }
    };

    return(
         <div className='main-container'>

                <h1>Cadastro de Paradas</h1>
                <button onClick={() => window.history.back()}>
                    <img src={voltar} alt="" />
                </button>

      <form id='register' onSubmit={handleSubmit}>
             <div className='full-box'>
                    <label htmlFor='id_op'>Id da Operação</label>
                    <input
                        type='text'
                        name='id_op'
                        id='id_op'
                        placeholder='Para visualizar os campos, digite o id da operação'
                        value={idOperacao}
                        onChange={(event) => {
                            const newValue = event.target.value;
                            setIdOperacao(newValue);
                            if (newValue) {
                                fetchOperacaoData(newValue);
                            }
                        }}
                    />
                </div>
               <div className='half-box spacing'>
                    <label htmlFor='tipoOperacao'>Tipo de Operação</label>
                    <input
                        type='text'
                        name='tipoOP'
                        id='tipoOperacao'
                        placeholder='digite o id da operação...'
                        value={paradas.tipoOperacao}
                        onChange={handleTipoOperacaoChange}
                        d
                    />
                </div>
                <div className='half-box'>
                    <label htmlFor='formaOperacao'>Forma de Operação</label>
                    <input
                        type='text'
                        name='formaOP'
                        id='formaOperacao'
                        placeholder='digite o id da operação...'
                        value={paradas.formaOperacao}
                        onChange={handleFormaOperacaoChange}
                        readOnly
                    >
                    </input>
                </div>
                <div className='half-box spacing'>
                    <label htmlFor='uf'>UF</label>
                    <input
                        type='text'
                        name='uf'
                        id='uf'
                        placeholder='digite o id da operação...'
                        value={paradas.uf}
                        readOnly
                    >
                    </input>
                </div>       
                <div className='half-box'>
                    <label htmlFor='floresta'>Floresta</label>
                    <input
                        type='text'
                        name='floresta'
                        id='floresta'
                        value={paradas.floresta}
                        placeholder='digite o id da operação...'
                        onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            floresta: event.target.value
                        }))}
                        readOnly
                    >
                        
                    </input>
                </div>
                <div className='half-box spacing'>
                    <label htmlFor='data'>Data</label>
                    <input
                    type='date'
                    name='data'
                    id='data'
                    value={paradas.data}
                    onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            data: event.target.value
                        }))}
                    />
                </div>
                <div className='half-box '>
                    <label htmlFor='Frota'>Frota</label>
                    <input
                    type='text'
                    name='frota'
                    id='frota'
                    value={paradas.frota}
                    placeholder='digite o id da operação...'
                    onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            frota: event.target.value
                        }))}
                    readOnly
                    >
                    </input>
                </div>
                <div className='half-box spacing'>
                <label htmlFor='operador'>Operador</label>
                <input
                    type='text'
                    name='operador'
                    id='operador'
                    value={paradas.operador}
                    placeholder='digite o id da operação...'
                                onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            operador: event.target.value
                        }))}
                    readOnly
                />
                </div>
                <div className='half-box'>
                <label htmlFor='turno'>Turno</label>
                <input
                    type='text'
                    name='turno'
                    id='turno'
                    value={paradas.turno}
                    placeholder='digite o id da operação...'
                    onChange={(event) => setOperacoes(prevState => ({
                        ...prevState,
                        turno: event.target.value
                    }))}
                    readOnly
                >                 
                </input>
                </div>
                <div className='half-box spacing'>
                <label htmlFor='hi'>Hora Inicial</label>
                <input
                    type='time'
                    name='hi'
                    id='hi'
                    placeholder='digite a hora inicial'
                            onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            hi: event.target.value
                        }))}
                />
                </div>
                <div className='half-box '>
                    <label htmlFor='hf'>Hora Final</label>
                    <input
                        type='time'
                        name='hf'
                        id='hf'
                        placeholder='digite a hora final'
                            onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            hf: event.target.value
                        }))}
                    />
                </div>
                <div className='half-box spacing'>
                    <label htmlFor='motivo'>Motivo</label>
                    <select
                        type='text'
                        name='motivo'
                        id='motivo'
                        placeholder='digite o motivo'
                        onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            motivo: event.target.value
                        }))}
                    >
                            {servicoRealizadoOptions.map((option, index) => (
                                <option key={index} value={option}>{option}</option>
                            ))}             
                    </select>
                </div>   
                <div className='half-box'>
                    <label htmlFor='obs'>Observação</label>
                    <input
                        type='text'
                        name='obs'
                        id='obs'
                        placeholder='digite uma observação'
                                        onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            observacao: event.target.value
                        }))}
                    />
                </div>       
        <div className='full-box'>
          <input type='submit' name='cadastro' id='cadastro' value='CADASTRAR' />
        </div>
      </form>
    </div>
    )
}

export default CadParadas