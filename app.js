const API = "http://localhost:8080";
// atalho para usar o document.querySelector
const qs = (sel) => document.querySelector(sel);

const usuarioIdEl = qs("#usuarioId");
const listaEl = qs("#lista");

qs("#btnCarregar").addEventListener("click", carregar);
qs("#btnCriar").addEventListener("click", criar);

// carregar tarefas pelo ID
async function carregar() {
    const uid = Number(usuarioIdEl.value);
    if (!uid) { alert("Informe o ID do usuário"); return; }
    const res = await fetch(`${API}/tarefas?usuarioId=${uid}`);
    const data = await res.json();
    render(data);
}

// mostrar tarefas
function render(tarefas) {
    listaEl.innerHTML = "";
    tarefas.forEach(t => {
        // cria uma lista para cada tarefa
        const li = document.createElement("li");
        // conteúdo da tarefa (titulo, status, descricao)
        const left = document.createElement("div");
        left.innerHTML = `<b>${t.titulo}</b><br><span class="muted">${t.status}</span><br>${t.descricao ?? ""}`;
        // botões para ação
        const actions = document.createElement("div");
        actions.className = "actions";
        // botões para editar
        const btnEdit = document.createElement("button");
        btnEdit.textContent = "Editar";
        btnEdit.onclick = () => editarPrompt(t);
        // botões para deletar
        const btnDel = document.createElement("button");
        btnDel.textContent = "excluir";
        btnDel.onclick = () => excluir(t.id);
        // anexar tudo junto
        actions.appendChild(btnEdit);
        actions.appendChild(btnDel);
        li.appendChild(left);
        li.appendChild(actions);
        listaEl.appendChild(li);
    });
}

async function criar() {
    const uid = Number(usuarioIdEl.value);
    const titulo = qs("#titulo").value.trim();
    const descricao = qs("#descricao").value.trim();
    const status = qs("#status").value;
    // validação
    if (!uid || !titulo) { alert("Usuário e título são obrigatórios"); return; }
    // chamada de API para criar a tarefa
    const res = await fetch(`${API}/tarefas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({titulo, descricao, status, usuarioId: uid})
    });
    if (!res.ok) { alert("Erro ao criar"); return; }
    await carregar(); // recarregar tarefas
    // limpar formulário
    qs("#titulo").value = "";
    qs("#descricao").value = "";
    qs("#status").value = "PENDENTE";
}

async function editarPrompt(t) {
    // usa prompt do browser para editar (mudar no futuro)
    const novoTitulo = prompt("Novo título:", t.titulo);
    if (novoTitulo === null) return;
    const novoStatus = prompt("Novo status (PENDENTE, EM ANDAMENTO, CONCLUIDA):", t.status);
    if (novoStatus === null) return;
    const novaDesc = prompt("Nova descrição:", t.descricao ?? "");
    await editar(t.id, { titulo: novoTitulo, status: novoStatus, descricao: novaDesc}); 
}

async function editar(id, payload) {
    // chamada de API para atualizar a tarefa
    const res = await fetch(`${API}/tarefas/${id}`, {
        method: "PUT",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(payload)
    });
    if (!res.ok) { alert("Erro ao atualizar"); return; }
    await carregar(); 
}

async function excluir(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    const res = await fetch(`${API}/tarefas/${id}`, { method: "DELETE" });
    if (!res.ok) { alert("Erro ao excluir"); return; }
    await carregar(); 
}
