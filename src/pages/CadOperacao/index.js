import './style.css';
import React, { useState, useCallback, useEffect } from 'react';
import voltar from './img/voltar.png';


const CadOperacao = () => {
    const matricula = localStorage.getItem('matricula');
    const [operacoes, setOperacoes] = useState({
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
        sf: '',
        rendimento: ''
    });

    

    const [servicoRealizadoOptions, setServicoRealizadoOptions] = useState([]);
    const [florestaOptions, setFlorestaOptions] = useState([]);
    const [rendimento, setRendimento] = useState('');

    useEffect(() => {
        if (operacoes.hi !== '' && operacoes.hf !== '') {
            const rendimentoValue = parseFloat(operacoes.hf) - parseFloat(operacoes.hi);
            setRendimento(rendimentoValue.toFixed(2));
        }
    }, [operacoes.hi, operacoes.hf]);

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
            sf: '',
            rendimento: ''
        });
        setServicoRealizadoOptions([]);
        setFlorestaOptions([]);
        alert("Operação cadastrada com sucesso");
    }, [setOperacoes, setServicoRealizadoOptions, setFlorestaOptions]);

    const saveOfflineData = useCallback((data) => {
        let offlineData = JSON.parse(localStorage.getItem('operacoesOffline')) || [];
        const existingIndex = offlineData.findIndex(item => item.id === data.id);
        if (existingIndex === -1) {
            offlineData.push(data);
            localStorage.setItem('operacoesOffline', JSON.stringify(offlineData));
        }
        alert('Dados salvos localmente. Eles serão enviados quando houver conexão com a internet.');
        clearOptionsAndShowMessage(); 
    }, [clearOptionsAndShowMessage]); 



    const formatarData = (data) => {
    const partes = data.split('-'); 
    return `${partes[2]}/${partes[1]}/${partes[0]}`; 
        };

    const syncOfflineData = useCallback(() => {
        const offlineData = JSON.parse(localStorage.getItem('operacoesOffline')) || [];
        if (offlineData.length > 0) {
            const backendEndpoint = 'http://192.168.156.16:5000/operacoes';
            Promise.all(offlineData.map(data => {
                return fetch(backendEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                })
                .then(resp => {
                    if (resp.ok) {
                        return data.id; 
                    } else {
                        throw new Error('Erro ao enviar dados salvos offline');
                    }
                });
            }))
            .then(successfulIds => {
                const updatedOfflineData = offlineData.filter(data => !successfulIds.includes(data.id));
                localStorage.setItem('operacoesOffline', JSON.stringify(updatedOfflineData));
            })
            .catch(err => {
                console.error(err);
            });
        }
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (navigator.onLine) {
                syncOfflineData();
            }
        }, 5000);
        return () => clearInterval(intervalId);
    }, [syncOfflineData]);

    const createPost = (operacoes) => {
        const operacaoComMatricula = { ...operacoes, matricula: matricula };
        const backendEndpoint = 'http://192.168.156.16:5000/operacoes';
        fetch(backendEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(operacaoComMatricula),
        })
        .then((resp) => {
            if (resp.ok) {
                const offlineData = JSON.parse(localStorage.getItem('operacoesOffline')) || [];
                const updatedOfflineData = offlineData.filter((data) => data.id !== operacoes.id); 
                localStorage.setItem('operacoesOffline', JSON.stringify(updatedOfflineData));
            }
            return resp.json();
        })
        .then((data) => {
            console.log(data);
            clearOptionsAndShowMessage();
        })
        .catch((err) => {
            console.log(err);
            saveOfflineData(operacoes); 
        });
    };



    const handleSubmit = (event) => {
        event.preventDefault();
        const dataFormatada = formatarData(operacoes.data);
        const updatedOperacoes = { ...operacoes, rendimento, data: dataFormatada, id: Date.now() }; 
        if (navigator.onLine) {
            createPost(updatedOperacoes);
        } else {
            saveOfflineData(updatedOperacoes);
        }
    };
    



    const handleTipoOperacaoChange = (event) => {
        const { value } = event.target;
        setOperacoes(prevState => ({
            ...prevState,
            tipoOperacao: value
        }));
        updateServicoRealizadoOptions(value, operacoes.formaOperacao);
    };

    const handleFormaOperacaoChange = (event) => {
        const { value } = event.target;
        setOperacoes(prevState => ({
            ...prevState,
            formaOperacao: value
        }));
        updateServicoRealizadoOptions(operacoes.tipoOperacao, value);
    };

    const handleUFChange = (event) => {
        const { value } = event.target;
        setOperacoes(prevState => ({
            ...prevState,
            uf: value
        }));
        updateFlorestaOptions(value);
    };

    const updateServicoRealizadoOptions = (tipoOp, formaOp) => {
        if (tipoOp === 'silvicultura') {
            if (formaOp === 'manual') {
                setServicoRealizadoOptions(['Plantio', 'Herbicída', 'Adubação', 'Formiga', 'Replantio', 'Capina', 'Limpeza de Área']);
            } else if (formaOp === 'mecanizada') {
                setServicoRealizadoOptions(['Roçada', 'Herbicída', 'Irrigação', 'Subsolagem', 'Preparo de Solo', 'Adubação', 'Carreador', 'Limpeza de Área']);
            }
        } else if (tipoOp === 'colheita') {
            if (formaOp === 'manual') {
                setServicoRealizadoOptions(['']);
            } else if (formaOp === 'mecanizada') {
                setServicoRealizadoOptions(['Derrubada', 'Arraste', 'Estaleirar', 'Traçamento', 'Picagem', 'Estradas']);
            }
        } else {
            setServicoRealizadoOptions([]);
        }
    };

    const updateFlorestaOptions = (selectedUF) => {
        if (selectedUF === 'ms') {
            setFlorestaOptions(['Palmeira-Cuê', 'Invernadinha', 'Primavera', 'Caarapozinho', 'Rio Brilhante', 'Bonito']);
        } else if (selectedUF === 'pr') {
            setFlorestaOptions(['Boa Vista', 'Im. Guair. Agrocafeeira', 'Conda', 'Incubatório', 'Vila Celeste', 'UIR', 'Fazenda Britânia', 'Faz. Monte Bello', 'Xaxim', 'Favaretto', 'Unidade Aquidaban', 'São Vicente', 'URA', 'Maralúcia', 'Serranópolis', 'Nova Roma', 'UIA 2', 'Diamante', 'UIA', 'Boa Vista', 'UPL Linha Lindamar Itaip.', 'Faz. Estrela Azul - URN', 'UPD Toledo', 'Itaipulândia', 'Santa Luzia', 'Picada Benjamin', 'Casa Amarela', 'Teló-Linha Panizon', 'UPD Moreninha', 'Camargo', 'UIA 4']);
        }else{
             setFlorestaOptions([])
        }
    };

    return(
    <div className='main-container'>
                <h1>Cadastro de Operações</h1>
                <button onClick={() => window.history.back()}>
                    <img src={voltar} alt="" />
                </button>

      <form id='register' onSubmit={handleSubmit}>
               <div className='half-box spacing'>
                    <label htmlFor='tipoOP'>Tipo de Operação</label>
                    <select
                        type='text'
                        name='tipoOP'
                        id='tipoOP'
                        onChange={handleTipoOperacaoChange}
                    >
                        <option value="">Selecionar</option>
                        <option value="silvicultura">Silvicultura</option>
                        <option value="colheita">Colheita</option>
                    </select>
                </div>
                <div className='half-box'>
                    <label htmlFor='formaOP'>Forma de Operação</label>
                    <select
                        type='text'
                        name='formaOP'
                        id='formaOP'
                        onChange={handleFormaOperacaoChange}
                    >
                        <option value="">Selecionar</option>
                        <option value="manual">Manual</option>
                        <option value="mecanizada">Mecanizada</option>
                    </select>
                </div>
                <div className='half-box spacing'>
                    <label htmlFor='uf'>UF</label>
                    <select
                        type='text'
                        name='uf'
                        id='uf'
                        onChange={handleUFChange}
                    >
                        <option value="">Selecionar</option> 
                        <option value="ms">MS</option>
                        <option value="pr">PR</option>
                    </select>
                </div>
                <div className='half-box'>
                    <label htmlFor='floresta'>Floresta</label>
                    <select
                        type='text'
                        name='floresta'
                        id='floresta'
                        placeholder='Digite sua floresta'
                        onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            floresta: event.target.value
                        }))}
                    >
                        {florestaOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                        
                    </select>
                </div>
          <div className='half-box spacing'>
            <label htmlFor='data'>Data</label>
            <input
                type='date'
                name='data'
                id='data'
                value={operacoes.data}
                onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    data: event.target.value
                }))}
            />
        </div>
          <div className='half-box '>
            <label htmlFor='Frota'>Frota</label>
            <select
              type='text'
              name='frota'
              id='frota'
              placeholder='digite a frota'
              onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    frota: event.target.value
                }))}
            >
                <option value="">Selecionar</option>
                <option value="AAA1055">AAA1055</option>
                <option value="AAA1113">AAA1113</option>
                <option value="AAA1276">AAA1276</option>
                <option value="AAA1304">AAA1304</option>
                <option value="RHJ2I06">RHJ2I06</option>
                <option value="BEO8E52">BEO8E52</option>
                <option value="SEP8J64">SEP8J64</option>
                <option value="SDR7G88">SDR7G88</option>
                <option value="AAA1279">AAA1279</option>

   

            </select>
        </div>
        <div className='half-box spacing'>
          <label htmlFor='operador'>Operador</label>
          <input
            type='text'
            name='operador'
            id='operador'
            placeholder='digite o nome do operador'
            onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    operador: event.target.value
                }))}
          />
        </div>
        <div className='half-box'>
          <label htmlFor='turno'>Turno</label>
          <select
            type='text'
            name='turno'
            id='turno'
            placeholder='digite o turno'
               onChange={(event) => setOperacoes(prevState => ({
                ...prevState,
                turno: event.target.value
            }))}
          >
                <option value="">Selecionar</option>
                <option value="A">A</option>
                <option value="B">B</option>      
                <option value="C">C</option>      
                <option value="ADM">ADM</option>                    
          </select>
        </div>
        <div className='half-box spacing'>
          <label htmlFor='hi'>Horímetro inicial</label>
          <input
            type='text'
            name='hi'
            id='hi'
            placeholder='digite a hora inicial'
            onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    hi: event.target.value
                }))}
          />
        </div>
        <div className='half-box'>
            <label htmlFor='hf'>Horímetro final</label>
            <input
                type='text'
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
            <label htmlFor='sf'>Serviço Realizado</label>
            <select
                type='text'
                name='sf'
                id='sf'
                placeholder='digite o serviço realizado'
                onChange={(event) => setOperacoes(prevState => ({
                    ...prevState,
                    sf: event.target.value
                }))}
            >
                        {servicoRealizadoOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}             
            </select>
        </div>
                <div className='half-box'>
                    <label htmlFor='rendimento'>Rendimento</label>
                    <input
                        type='text'
                        name='rendimento'
                        id='rendimento'
                        value={rendimento}
                        readOnly 
                            onChange={(event) => setOperacoes(prevState => ({
                            ...prevState,
                            rendimento: event.target.value
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

export default CadOperacao