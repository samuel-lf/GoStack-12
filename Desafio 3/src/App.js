import React, { useState, useEffect } from "react";
import api from './services/api'
import "./styles.css";

function App() {
  const [repositories, setRepositories] = useState([]);

  useEffect(() => {
    api.get('/repositories').then((response) =>{
      if(response.status === 200){
        setRepositories([...response.data]);
      }
    })
  }, [])

  async function handleAddRepository() {
    api.post('/repositories', {
      "title": "Umbriel",
      "url": "https://github.com/Rocketseat/umbriel",
      "techs": ["Node", "Express", "TypeScript"]
    }).then((response) =>{
      if(response.status === 200){
        setRepositories([...repositories, response.data]);
      }
    })
  }

  async function handleRemoveRepository(id) {
    api.delete(`/repositories/${id}`).then((response) =>{
      if(response.status === 204){
        const repositoryIndex = repositories.findIndex(repository => repository.id === id);
        setRepositories(repositories.filter((repository, index) => index !== repositoryIndex));
      }
    })
  }

  return (
    <div>
      <ul data-testid="repository-list">
        {
          repositories.map(repository => (
            <li key={repository.id}>

              {repository.title}

              <button onClick={() => handleRemoveRepository(repository.id)}>
                Remover
              </button>
            </li>
            )
          )
        }
      </ul>

      <button onClick={handleAddRepository}>Adicionar</button>
    </div>
  );
}

export default App;
