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
    const [timer, setTimer] = useState(null);

        const delayedFetchOperacao = useCallback(
        (id) => {
            clearTimeout(timer); // Limpa o temporizador existente
            const newTimer = setTimeout(() => {
                fetchOperacao(id);
            }, 1000); // Define um atraso de 2 segundos
            setTimer(newTimer);
        },
        [timer]
    );

        const fetchOperacao = async (id) => {
        const operacoesEndpoint = `http://192.168.156.16:5000/operacoes/${id}`;

    try {
        const response = await fetch(operacoesEndpoint);
        if (response.ok) {
            const data = await response.json();
            if (data && data.length > 0) {
                console.log('Dados da operação:', data[0]);
                setOperacoes({
                            tipoOperacao: data[0].tipoOperacao || '',
                            formaOperacao: data[0].formaOperacao || '',
                            uf: data[0].uf || '',
                            floresta: data[0].floresta || '',
                            data: data[0].data || '',
                            frota: data[0].frota || '',
                            operador: data[0].operador || '',
                            turno: data[0].turno || '',
                            hi: data[0].hi || '',
                            hf: data[0].hf || '',
                        });
                    } else {
                        alert('Nenhum dado retornado para o ID de operação fornecido.');
                    }
                } else {
                    alert('ID de operação não encontrado');
                }
            } catch (error) {
                console.error('Erro ao buscar operação:', error);
                alert('Erro ao buscar operação. Verifique o console para mais detalhes.');
            }
        };

    const saveOfflineData = (data) => {
        let offlineData = JSON.parse(localStorage.getItem('paradasOffline')) || []; 
        if (!Array.isArray(offlineData)) {
            offlineData = [offlineData];
            console.log(offlineData)
        }
        offlineData.push(data);
        localStorage.setItem('paradasOffline', JSON.stringify(offlineData));
        alert('Dados salvos localmente. Eles serão enviados quando houver conexão com a internet.');
        clearOptionsAndShowMessage();
    };

const syncOfflineData = () => {
    const offlineData = JSON.parse(localStorage.getItem('paradasOffline')) || [];
    const syncIndexes = []; 
    
    if (offlineData.length > 0) {
        const backendEndpoint = 'http://192.168.156.16:5000/paradas';
        const syncRequests = offlineData.map((data, index) => {
            return fetch(backendEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then((resp) => {
                if (resp.ok) {
                    syncIndexes.push(index); 
                }
            })
            .catch((err) => {
                console.error('Erro ao enviar dados salvos offline:', err);
            });
        });

        Promise.all(syncRequests).then(() => {
            const updatedOfflineData = offlineData.filter((_, index) => !syncIndexes.includes(index));
            localStorage.setItem('paradasOffline', JSON.stringify(updatedOfflineData));
        });
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
        const backendEndpoint = 'http://192.168.156.16:5000/paradas';
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
            if (navigator.onLine) {
                createPost(paradas);
            } else {
                saveOfflineData(paradas);
            }
            clearOptionsAndShowMessage();
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



    const updateServicoRealizadoOptions = (tipoOp, formaOp) => {
        if (tipoOp === 'silvicultura') {
            if (formaOp === 'manual') {
                setServicoRealizadoOptions(['Chuva', 'Refeição', 'Outro']);
            } else if (formaOp === 'mecanizada') {
                setServicoRealizadoOptions(['Lubrificação', 'Hidráulica', 'Borracharia', 'Mecânica', 'Abastecer', 'Chuva', 'Outro']);
            }
        } else if (tipoOp === 'colheita') {
            if (formaOp === 'manual') {
                setServicoRealizadoOptions([]);
            } else if (formaOp === 'mecanizada') {
                setServicoRealizadoOptions(['Lubrificação', 'Hidráulica', 'Borracharia', 'Mecânica', 'Abastecer', 'Chuva','Refeição','Outro']);
            }
        } else {
            setServicoRealizadoOptions([]);
        }
    };


    const handleIdOperacaoChange = (event) => {
        const idOperacao = event.target.value;
        delayedFetchOperacao(idOperacao);
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
                        type='number'
                        name='id_op'
                        id='id_op'
                        onChange={handleIdOperacaoChange} 
                    />
                </div>
               <div className='half-box spacing'>
                    <label htmlFor='tipoOperacao'>Tipo de Operação</label>
                    <input
                        type='text'
                        name='tipoOP'
                        id='tipoOperacao'
                        onChange={handleTipoOperacaoChange}
                    >
                    </input>
                </div>
                <div className='half-box'>
                    <label htmlFor='formaOperacao'>Forma de Operação</label>
                    <input
                        type='text'
                        name='formaOP'
                        id='formaOperacao'
                        onChange={handleFormaOperacaoChange}
                    >
                    </input>
                </div>
                <div className='half-box spacing'>
                    <label htmlFor='uf'>UF</label>
                    <input
                        type='text'
                        name='uf'
                        id='uf'
                    >
                    </input>
                </div>       
                <div className='half-box'>
                    <label htmlFor='floresta'>Floresta</label>
                    <input
                        type='text'
                        name='floresta'
                        id='floresta'
                        placeholder='Digite sua floresta'
                        onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            floresta: event.target.value
                        }))}
                    >
                        
                    </input>
                </div>
         <div className='half-box spacing'>
            <label htmlFor='data'>Data</label>
            <input
              type='date'
              name='data'
              id='data'
              placeholder='digite a data'
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
              placeholder='digite a frota'
              onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    frota: event.target.value
                }))}
            >
            </input>
        </div>
        <div className='half-box spacing'>
          <label htmlFor='operador'>Operador</label>
          <input
            type='text'
            name='operador'
            id='operador'
            placeholder='Digite o nome do operador'
                        onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    operador: event.target.value
                }))}
          />
        </div>
        <div className='half-box'>
          <label htmlFor='turno'>Turno</label>
          <input
            type='text'
            name='turno'
            id='turno'
            placeholder='digite o turno'
               onChange={(event) => setOperacoes(prevState => ({
                ...prevState,
                turno: event.target.value
            }))}
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