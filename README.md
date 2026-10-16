# 💼 Empreendedorismo em Foco

> **Guia prático de segurança jurídica, sanitária e digital para microempreendedoras**  
> *Projeto de Extensão Universitária — Centro Universitário UNEX (Vitória da Conquista - BA)*  
> Parceria Interdisciplinar: **Direito** & **Sistemas de Informação**

---

## 📌 Sobre o Projeto

O **Empreendedorismo em Foco** é uma iniciativa acadêmica desenvolvida para apoiar mulheres microempreendedoras locais (confeiteiras, marmiteiras, manicures, cabeleireiras, esteticistas, artesãs, fotógrafas, designers e prestadoras de serviços). 

O projeto traduz normas jurídicas, sanitárias e regulatórias complexas em uma linguagem clara, acessível e orientada à prática diária, auxiliando na prevenção de litígios, fraudes e infrações sanitárias.

---

## 🎯 Metodologia em 3 Camadas

Todo o conteúdo normativo foi modelado a partir das orientações do curso de Direito em três camadas complementares:

1. **📜 1. O que a Lei diz**: Dispositivos e artigos oficiais (CDC, Código Civil, LGPD, Anvisa, Lei do Salão-Parceiro, ECA).
2. **💡 2. O que isso significa na prática**: Impactos reais no dia a dia do negócio (pedidos, cancelamentos, entregas, atendimentos).
3. **🛡️ 3. Como evitar o problema**: Passos preventivos e condutas recomendadas para proteger o negócio e a cliente.

---

## 🧭 Tópicos Contemplados no Guia

O portal aborda na íntegra as 22 seções e diretrizes elaboradas pela equipe de Direito:

- **Regras Gerais para Qualquer Negócio**: Deveres do vendedor, dever de informação e cumprimento da oferta.
- **Vendas pelo Instagram, WhatsApp e Internet**: Informações prévias obrigatórias, direito de arrependimento (7 dias) e validade jurídica de mensagens.
- **Contratos, Encomendas e Sinal**: Requisitos essenciais de um termo simples, combate a cláusulas abusivas e Lei do Salão-Parceiro (12.592/2012).
- **Cobranças, Reservas e Inadimplência**: Limites legais da cobrança (art. 42 do CDC), prevenção à exposição vexatória e regras de reserva.
- **Fotos, Vídeos, Imagem e LGPD**: Direitos da personalidade, consentimento com finalidade determinada, retirada a pedido da cliente e proteção reforçada de menores (ECA).
- **Venda de Comida & Vigilância Sanitária**: Boas práticas da Anvisa (RDC 216/2004), contaminação cruzada, rotulagem de alergênicos (RDC 727/2022) e delivery seguro.
- **Profissionais da Beleza & Estética**: Biossegurança, esterilização real vs. álcool 70%, proibição de formol em alisamentos e limites legais da atuação.
- **Roupas, Artesanato e Serviços**: Prazos de vício do CDC, políticas de troca, escopo de revisões e aprovação de modelos.
- **Segurança Digital & Golpes do Pix**: Prevenção a comprovantes falsificados, autenticação em dois fatores (2FA) e recuperação de contas invadidas.
- **Gestão de Reclamações**: Procedimentos diante de ameaças de Procon/processos e conduta em casos de danos físicos.
- **Checklists Interativos**: Ferramentas interativas de conferência rápida com salvamento automático local.
- **Situações Práticas (FAQ)**: Respostas objetivas para as dúvidas mais comuns do cotidiano.
- **Legislação e Fontes Oficiais**: Acesso direto aos portais do Planalto e da Anvisa.

---

## 🛠️ Tecnologias Utilizadas

O portal foi construído priorizando código limpo, semântico, leve e sem complexidade desnecessária (zero dependência de compilação pesada):

- **HTML5**: Semântico, estruturado com foco em acessibilidade e boas práticas de SEO.
- **CSS3 Puro**: Design system moderno com tokens, tipografia *Plus Jakarta Sans*, alinhamento simétrico responsivo (Desktop & Mobile) e ícones SVG inline (sem uso de emojis informais).
- **JavaScript Vanilla**:
  - `app.js`: Renderização dinâmica do banco de dados, busca em tempo real e filtros por categoria.
  - `checklist.js`: Checklists interativos com barra de progresso e persistência no `localStorage`.
  - `rating.js`: Sistema de avaliação por estrelas com métricas de engajamento para a apresentação da banca.

---

## 📁 Estrutura de Pastas e Arquivos

```text
Projeto Empreendedorismo/
│
├── index.html            # Aplicação principal modular
├── site-completo.html    # Versão standalone única (funciona offline com 2 cliques)
├── README.md             # Documentação e guia do projeto
│
├── assets/               # Recursos estáticos
│   ├── css/
│   │   ├── style.css       # Design tokens, tipografia, header, hero, footer e responsividade
│   │   └── components.css  # Cards em 3 camadas, checklists, acordeons e estrelas SVG
│   │
│   ├── js/
│   │   ├── app.js          # Busca, filtros por categoria, FAQ e fontes oficiais
│   │   ├── checklist.js    # Lógica dos checklists e cálculo de progresso
│   │   └── rating.js       # Widget de avaliação com estrelas SVG
│   │
│   ├── data/
│   │   └── content.json    # Base estruturada com todo o conteúdo normativo e checklists
│   │
│   └── img/                # Assets gráficos e ícones
│
└── docs/                 # Documentos de referência da equipe de Direito
    └── Guia Pratico Empreendedorismo em Foco.pdf
```

---

## 🚀 Como Executar Localmente

### Opção 1: Direto no Navegador
1. Basta dar um duplo clique no arquivo [`index.html`](index.html) ou no [`site-completo.html`](site-completo.html).
2. O arquivo `site-completo.html` é autossuficiente e funciona perfeitamente sem necessidade de conexão com internet ou servidor local.

### Opção 2: Servidor Local (Python)
Para testar como em um ambiente web tradicional:
```bash
# Executa servidor local na porta 3000
python -m http.server 3000
```
Em seguida, acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🌐 Hospedagem (Vercel ou GitHub Pages)

O projeto é 100% estático e pode ser publicado instantaneamente na **Vercel**, **Netlify** ou **GitHub Pages**:
- Não requer `build command` nem `install command`.
- O diretório raiz (`/`) serve diretamente o `index.html`.

---

## 👥 Equipe e Créditos

Projeto desenvolvido para a matéria de **Projeto de Extensão em Empreendedorismo**:
- **UNEX — Vitória da Conquista / BA**
- Parceria Interdisciplinar entre os cursos de **Direito** e **Sistemas de Informação**.
