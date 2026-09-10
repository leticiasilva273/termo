import inquirer from 'inquirer';
import chalk from 'chalk';
import validator from 'validator';
import { gerarHash, verificarHash } from './src/auth.ts';
import {
  inserirUsuario,
  obterUsuario,
  registrarVitoria,
  registrarDerrota,
  minhasStats,
  ranking,
} from './src/db/conexao.ts';
import type { Usuario } from './src/tipos.ts';


const normalizar = (valor: string) => String(valor ?? '').trim().toUpperCase();

const PALAVRAS: string[] = [  'CASAS', 'LIVRO', 'FESTA', 'NOITE', 'SOLAR', 'PRAIA', 'TEMPO', 'JOGAR', 'FELIZ', 'MUNDO', 'PEDRA', 'CORES', 'NORTE', 'AMIGO', 'SONHO', 'AMADO', 'AMADA', 'AFETO', 'MEDOS', 'RAIVA', 'CALMA', 'RISOS', 'CHORO', 'BRAVO', 'DOIDO', 'LOUCO', 'JOVEM', 'IDOSO', 'FORTE', 'FRACO', 'LINDO', 'BELAS', 'FLORA', 'FOLHA', 'FRUTA', 'GRAMA', 'CAMPO', 'NUVEM', 'CHUVA', 'VENTO', 'AREIA', 'LAGOA', 'TERRA', 'FONTE', 'ROCHA', 'MORRO', 'SELVA', 'POMAR',   'GATOS', 'TIGRE', 'COBRA', 'PEIXE', 'RATOS', 'SAPOS', 'ZEBRA', 'PANDA', 'CORVO', 'BURRO', 'CAVALO', 'LEAO', 'MACACO', 'PORTA', 'PRATO', 'GARFO', 'BOLSA', 'CHAVE', 'PAPEL', 'MOUSE', 'TECLA', 'TELAS', 'CABOS', 'LAPIS', 'ROUPA', 'CAMA', 'VIDRO', 'VELAS', 'CAIXA', 'FOTOS', 'ESPELHO', 'DADOS', 'REDES', 'LINUX', 'PIXEL', 'LOGIN', 'SITES', 'NODES', 'BYTES', 'APPS',  'ARROZ', 'PIZZA', 'MELAO', 'MANGA', 'SOPAS', 'DOCES', 'BOLOS', 'PASTA', 'MOLHO', 'CAFES', 'MEL', 'SALSA', 'CARNE',  'PARIS', 'HOTEL', 'PORTO', 'ILHAS', 'PONTE', 'TORRE', 'CASAS', 'RUELA',  'PULAR', 'NADAR', 'FALAR', 'OUVIR', 'COMER', 'BEBER', 'CRIAR', 'FAZER', 'VIVER', 'ANDAR', 'CORRE', 'SORRI', 'GANHA', 'PERDE', 'VERDE', 'PRETO', 'OUROS', 'PRATA', 'FOGO', 'MAGIA', 'IDEIA', 'VALOR', 'SORTE', 'REGRA', 'JOGOS', 'AGUAS', 'LUZES',  'ABRIR', 'ACHAR', 'AJUDA', 'ALBUM', 'ALTAR', 'ANIMA', 'ANTES', 'AROMA', 'ATIVO', 'BAILE', 'BAIXO', 'BANCO', 'BARCO', 'BEBER', 'BEIJO', 'BICHO', 'BLOCO', 'BRISA', 'BRILHO', 'CAUSA', 'CEDER', 'CERTO', 'CLARO', 'CLUBE', 'CORPO', 'CURAR', 'DANCA', 'DEDO', 'DEUS', 'DICAS', 'DORMIR', 'DORES', 'ETAPA', 'EXATO', 'FALHA', 'FAROL', 'FIBRA', 'FINAL', 'FLORES', 'FORNO', 'FORUM', 'GENTE', 'GRITO', 'GRUPO', 'HONRA', 'IDEAL', 'JANEL', 'JUNTO', 'LIMPO', 'LINHA', 'LOJAS', 'LONGE', 'LUGAR', 'LUZES', 'MAIOR', 'MANHA', 'MARCO', 'METAL', 'MUITO', 'MUSICA', 'NATAL', 'NIVEL', 'NOVOS', 'NUVEM', 'OLHAR', 'ORDEM', 'OUVIR', 'PAZES', 'PENAS', 'PESCA', 'PISTA', 'PLANO', 'POEMA', 'PONTO', 'PORTA', 'PRAZO', 'PRIMO', 'PROVA', 'QUASE', 'REINO', 'RISOS', 'RODAR', 'ROSTO', 'ROUPA', 'SABER', 'SAIDA', 'SAUDE', 'SEGUE', 'SINAL', 'SITES', 'SONHO', 'TARDE', 'TEXTO', 'TINTA', 'TIRAR', 'TODOS', 'TRABALHO', 'TRAMA', 'TROCA', 'UNICO', 'USADO', 'VALOR', 'VAMOS', 'VASTO', 'VIAJE', 'VISTA', 'VIVER', 'VOZES', ].map(normalizar).filter((p) => /^[A-Z]{5}$/.test(p));

const pause = async () => {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'x',
      message: 'Pressione ENTER para continuar',
    },
  ] as any);
};

function titulo() {
  console.clear();
  console.log(
    chalk.cyan.bold(
      '\n╔══════════════════════════════╗\n║        TERMO LAS VEGAS          ║\n║  Adivinhe a palavra secreta  ║\n╚══════════════════════════════╝\n'
    )
  );
}

async function login(): Promise<Usuario | undefined> {
  const dados: any = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Usuário:',
    },
    {
      type: 'password',
      name: 'senha',
      message: 'Senha:',
      mask: '*',
    },
  ]);

  const usuario = obterUsuario(dados.username);

  if (!usuario || !(await verificarHash(dados.senha, usuario.senha))) {
    console.log(chalk.red('❌ Usuário ou senha incorretos!'));
    return;
  }

  return usuario;
}

async function cadastro() {
  const dados: any = await inquirer.prompt([
    {
      type: 'input',
      name: 'nome',
      message: 'Nome:',
    },
    {
      type: 'input',
      name: 'username',
      message: 'Usuário:',
    },
    {
      type: 'password',
      name: 'senha',
      message: 'Senha (mínimo 8 caracteres):',
      mask: '*',
    },
  ]);

  if (
    !dados.nome ||
    !(validator as any).isAlphanumeric(dados.username) ||
    dados.senha.length < 8
  ) {
    console.log(
      chalk.red(
        '❌ Dados inválidos. Usuário deve ter apenas letras/números e senha mínimo 8 caracteres.'
      )
    );
    return;
  }

  if (obterUsuario(dados.username)) {
    console.log(chalk.red('❌ Esse usuário já existe!'));
    return;
  }

  inserirUsuario({
    nome: dados.nome,
    username: dados.username,
    senha: await gerarHash(dados.senha),
  });

  console.log(chalk.green('✅ Conta criada com sucesso!'));
}

function pintar(chute: string, palavra: string) {
  const resultado = Array(5).fill('gray');
  const usados = Array(5).fill(false);

  // 🟢 Primeiro verifica letras na posição correta
  for (let i = 0; i < 5; i++) {
    if (chute[i] === palavra[i]) {
      resultado[i] = 'green';
      usados[i] = true;
    }
  }

  // 🟡 Depois verifica letras que existem em outra posição
  for (let i = 0; i < 5; i++) {
    if (resultado[i] === 'green') continue;

    for (let j = 0; j < 5; j++) {
      if (
        !usados[j] &&
        chute[i] === palavra[j]
      ) {
        resultado[i] = 'yellow';
        usados[j] = true;
        break;
      }
    }
  }

  // 🎨 Agora imprime cada letra corretamente
  let linha = '';

  for (let i = 0; i < 5; i++) {
    const letra = ` ${chute[i]} `;

    if (resultado[i] === 'green') {
      linha += chalk.bgGreen.black(letra);
    } else if (resultado[i] === 'yellow') {
      linha += chalk.bgYellow.black(letra);
    } else {
      linha += chalk.bgGray.white(letra);
    }
  }

  console.log(linha);
}
  


async function jogar(usuario: Usuario) {
  titulo();

  const palavra: string = PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)] ?? '';

  if (!palavra) {
    console.log(chalk.red('❌ Não foi possível carregar a palavra do jogo.'));
    return;
  }

  console.log(chalk.white('A palavra possui 5 letras. Você tem 6 tentativas.\n'));

  let erros = 0;

  for (let tentativa = 1; tentativa <= 6; tentativa++) {
    const resposta: any = await inquirer.prompt([
      {
        type: 'input',
        name: 'chute',
        message: `Tentativa ${tentativa}/6:`,
      },
    ]);

    const chuteFinal = String(resposta?.chute ?? '').trim().toUpperCase();

    if (chuteFinal.length !== 5) {
      console.log(chalk.red('Digite exatamente 5 letras!'));
      tentativa--;
      continue;
    }

    pintar(chuteFinal, palavra);

    if (chuteFinal === palavra) {
      registrarVitoria(usuario.id, erros);
      console.log(
        chalk.green.bold(`\n🎉 PARABÉNS! Você acertou em ${tentativa} tentativa(s)! 🔥`)
      );
      return;
    }

    erros++;
  }

  registrarDerrota(usuario.id, erros);
  console.log(chalk.red.bold(`\n💔 Você perdeu! A palavra era: ${palavra}`));
}

async function verRanking() {
  titulo();

  const ranking_dados = ranking();

  console.log(chalk.yellow.bold('🏆 RANKING — Maior sequência / Menos erros\n'));

  ranking_dados.forEach((jogador, indice) => {
    const medalhas = ['🥇', '🥈', '🥉'];
    const posicao = medalhas[indice] ?? `${indice + 1}º`;

    console.log(
      `${posicao} ${chalk.cyan(jogador.nome.padEnd(16))} 🔥 ${jogador.melhor_sequencia} | ❌ ${jogador.total_erros} | ✅ ${jogador.palavras_acertadas}`
    );
  });

  if (!ranking_dados.length) {
    console.log('Ainda não há jogadores no ranking.');
  }
}

async function menu(usuario: Usuario) {
  while (true) {
    titulo();

    const stats = minhasStats(usuario.id);

    console.log(
      chalk.blue(`👤 ${usuario.nome} | 🔥 Atual: ${stats.sequencia_atual} | 🏆 Melhor: ${stats.melhor_sequencia}\n`)
    );

    const { opcao } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcao',
        message: 'O que deseja fazer?',
        choices: ['🎮 Jogar', '🏆 Ver ranking', '📊 Minhas estatísticas', '🚪 Sair'],
      },
    ] as any);

    switch (opcao) {
      case '🎮 Jogar':
        await jogar(usuario);
        await pause();
        break;

      case '🏆 Ver ranking':
        await verRanking();
        await pause();
        break;

      case '📊 Minhas estatísticas':
        console.log(stats);
        await pause();
        break;

      case '🚪 Sair':
        return;
    }
  }
}

async function criarUsuarioPadrao() {
  if (!obterUsuario('Leleh')) {
    inserirUsuario({
      nome: 'Leticia Silva Almeida',
      username: 'Leleh',
      senha: await gerarHash('Mnb2711@'),
    });
  }
}

async function main() {
  await criarUsuarioPadrao();

  while (true) {
    titulo();

    const { opcao } = await inquirer.prompt([
      {
        type: 'list',
        name: 'opcao',
        message: 'Escolha:',
        choices: ['🔐 Login', '📝 Criar conta', '🚪 Sair'],
      },
    ] as any);

    switch (opcao) {
      case '🔐 Login':
        const usuario = await login();
        if (usuario) {
          await menu(usuario);
        } else {
          await pause();
        }
        break;

      case '📝 Criar conta':
        await cadastro();
        await pause();
        break;

      case '🚪 Sair':
        console.log(chalk.cyan('\nAté a próxima! 👋\n'));
        process.exit();
    }
  }
}

main();
