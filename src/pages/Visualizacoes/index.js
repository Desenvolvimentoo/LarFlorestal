import React, { useState, useEffect } from 'react';
import './style.css';
import voltar from './img/voltar.png';

const Visualizacoes = () => {
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [tipoOPSelecionado, setTipoOPSelecionado] = useState('');
  const [ufSelecionada, setUFSelecionada] = useState('');
  const [dataSelecionada, setDataSelecionada] = useState('');
  const [datasDisponiveis, setDatasDisponiveis] = useState([]);
  const [ufDisponiveis, setUFDisponiveis] = useState([]);
  const [tipoOPDisponiveis, setTipoOPDisponiveis] = useState([]);
  const [frotaSelecionada, setFrotaSelecionada] = useState('');
  const [frotaDisponiveis, setFrotaDisponiveis] = useState([]);
  const [dados, setDados] = useState([]);
  const [detalhes, setDetalhes] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (tipoSelecionado !== '') {
          let url = `http://192.168.156.16:5000/${tipoSelecionado.toLowerCase()}`;
          if (tipoSelecionado === 'Operacoes' && tipoOPSelecionado !== '') {
            url += `?tipoOperacao=${tipoOPSelecionado.toLowerCase()}`;
          }
          console.log("URL da requisição:", url);
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Erro ao buscar dados');
          }
          const data = await response.json();
          console.log("Dados recebidos:", data);
          setDados(data);

          const uniqueDates = [...new Set(data.map(item => item.data))];
          setDatasDisponiveis(uniqueDates);

          const uniqueUFs = [...new Set(data.map(item => item.uf))];
          setUFDisponiveis(uniqueUFs);

          const uniqueTipoOPs = [...new Set(data.map(item => item.tipoOperacao))];
          setTipoOPDisponiveis(uniqueTipoOPs);

          const uniqueFrotas = [...new Set(data.map(item => item.frota))];
          setFrotaDisponiveis(uniqueFrotas);
        }
      } catch (error) {
        console.error(`Erro ao buscar ${tipoSelecionado.toLowerCase()}:`, error);
        setError('Erro ao buscar dados');
      }
    };

    fetchData();
  }, [tipoSelecionado, tipoOPSelecionado]);

  const handleTipoChange = (event) => {
    const { value } = event.target;
    setTipoSelecionado(value);
    setTipoOPSelecionado('');
    setDataSelecionada('');
    setUFSelecionada('');
    setFrotaSelecionada('');
    setDetalhes(null);
    setError(null);
  };

  const handleUFChange = (event) => {
    setUFSelecionada(event.target.value);
  };

  const handleDataChange = (event) => {
    setDataSelecionada(event.target.value);
  };

  const handleTipoOPChange = (event) => {
    setTipoOPSelecionado(event.target.value);
  };

  const handleFrotaChange = (event) => {
    setFrotaSelecionada(event.target.value);
  };

  const handleItemClick = (item) => {
    setDetalhes(item);
  };

  const isMobile = window.innerWidth < 999;

return (
  <div className="container-tudo voltar">
    <div className='tudo'>
      <div className='voltar'>
       <button onClick={() => window.history.back()}>
        <img style={{height:30, width: 30, marginLeft:2}}  src={voltar} alt="" />
      </button>     
        <div className="container">
            <h1>Operações e Paradas Cadastradas</h1>
        </div>  
      </div>
      <div className='tipo flex'>
        <select  value={tipoSelecionado} onChange={handleTipoChange}>
          <option value="">Selecionar</option>
          <option value="Operacoes">Operações</option>
          <option value="Paradas">Paradas</option>
        </select>
        <select  value={ufSelecionada} onChange={handleUFChange}>
          <option value="">Selecionar</option>
          {ufDisponiveis.map((uf, index) => (
            <option key={index} value={uf}>{uf}</option>
          ))}
        </select>
        <select  value={tipoOPSelecionado} onChange={handleTipoOPChange}>
          <option value="">Selecionar</option>
          {tipoOPDisponiveis.map((tipoOP, index) => (
            <option key={index} value={tipoOP}>{tipoOP}</option>
          ))}
        </select>
        <select value={frotaSelecionada} onChange={handleFrotaChange}>
          <option value="">Selecionar</option>
          {frotaDisponiveis.map((frota, index) => (
            <option key={index} value={frota}>{frota}</option>
          ))}
        </select>
        {tipoSelecionado !== '' && (
          <select value={dataSelecionada} onChange={handleDataChange}>
            <option value="">Selecionar</option>
            {datasDisponiveis.map((data, index) => (
              <option key={index} value={data}>{data}</option>
            ))}
          </select>
        )}
      </div>
    </div>
    {error && <div>Erro: {error}</div>}
    <div className="divTable">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Forma</th>
            <th>Operador</th>
            <th>Data</th>
          </tr>
        </thead>
        <tbody>
          {dados
            .filter(item => tipoOPSelecionado === '' || item.tipoOperacao === tipoOPSelecionado)
            .filter(item => ufSelecionada === '' || item.uf === ufSelecionada)
            .filter(item => frotaSelecionada === '' || item.frota === frotaSelecionada)
            .filter(item => dataSelecionada === '' || item.data === dataSelecionada)
            .map((item, index) => (
              <tr key={index} onClick={() => handleItemClick(item)}>
                <td>{item.tipoOperacao}</td>
                <td>{item.formaOperacao}</td>
                <td>{item.operador}</td>
                <td>{item.data}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    {detalhes && (
      <div className={`detalhes-operacao ${isMobile ? 'detalhes-lista' : ''}`}>
        {isMobile ? (
          <div>
            <h2>Detalhes de {tipoSelecionado}</h2>
            <ul>
              <li><strong>Id:</strong> {detalhes.id}</li>
              <li><strong>Tipo de Operação:</strong> {detalhes.tipoOperacao}</li>
              <li><strong>Forma de Operação:</strong> {detalhes.formaOperacao}</li>
              <li><strong>UF:</strong> {detalhes.uf}</li>
              <li><strong>Floresta:</strong> {detalhes.floresta}</li>
              <li><strong>Data_Operacao:</strong> {detalhes.data}</li>
              <li><strong>Frota:</strong> {detalhes.frota}</li>
              <li><strong>Operador:</strong> {detalhes.operador}</li>
              <li><strong>Turno:</strong> {detalhes.turno}</li>
              <li><strong>{tipoSelecionado === 'Paradas' ? 'Hora_Inicial' : 'Horimetro_Inicial'}</strong> {tipoSelecionado === 'Paradas' ? detalhes.hi : detalhes.hi}</li>
              <li><strong>{tipoSelecionado === 'Paradas' ? 'Hora_Final' : 'Horimetro_Final'}</strong>{tipoSelecionado === 'Paradas' ? detalhes.hf : detalhes.hf}</li>
              <li><strong>{tipoSelecionado === 'Paradas' ? 'motivo' : 'Servico_Realizado'}</strong>{tipoSelecionado === 'Paradas' ? detalhes.motivo : detalhes.sf}</li>
              <li><strong>{tipoSelecionado === 'Paradas' ? 'observação' : 'Rendimento'}</strong>{tipoSelecionado === 'Paradas' ? detalhes.observacao : detalhes.rendimento}</li>
              <li><strong>Usuário:</strong> {detalhes.matricula}</li>
              
            </ul>
          </div>
        ) : (
          <div>
            <h2>Detalhes de {tipoSelecionado}</h2>
            <table>
              <thead className='junto'>
                <tr>
                    <th>Id</th>
                    <th>Tipo_Operacao</th>
                    <th>Forma_Operacao</th>
                    <th>Uf</th>
                    <th>Floresta</th>
                    <th>Data_Operacao</th>
                    <th>Frota</th>
                    <th>Operador</th>
                    <th>Turno</th>
                    <th>{tipoSelecionado === 'Paradas' ? 'Hora_Inicial' : 'Horimetro_Inicial'}</th>
                    <th>{tipoSelecionado === 'Paradas' ? 'Hora_Final' : 'Horimetro_Final'}</th>
                    <th>{tipoSelecionado === 'Paradas' ? 'motivo' : 'Servico_Realizado'}</th>
                    <th>{tipoSelecionado === 'Paradas' ? 'observação' : 'Rendimento'}</th>
                    <th>Usuario</th>
                </tr>
              </thead>
              <tbody className='junto'>
                <tr>
                    <td>{detalhes.id}</td>
                    <td>{detalhes.tipoOperacao}</td>
                    <td>{detalhes.formaOperacao}</td>
                    <td>{detalhes.uf}</td>
                    <td>{detalhes.floresta}</td>
                    <td>{detalhes.data}</td>
                    <td>{detalhes.frota}</td>
                    <td>{detalhes.operador}</td>
                    <td>{detalhes.turno}</td>
                    <td>{tipoSelecionado === 'Paradas' ? detalhes.hi : detalhes.hi}</td>
                    <td>{tipoSelecionado === 'Paradas' ? detalhes.hf : detalhes.hf}</td>
                    <td>{tipoSelecionado === 'Paradas' ? detalhes.motivo : detalhes.sf}</td>
                    <td>{tipoSelecionado === 'Paradas' ? detalhes.observacao : detalhes.rendimento}</td>
                    <td>{detalhes.matricula}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    )}
  </div>
);

};

export default Visualizacoes;

