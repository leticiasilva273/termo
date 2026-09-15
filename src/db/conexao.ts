import { DatabaseSync } from 'node:sqlite';

import type { Usuario, Ranking } from '../tipos.ts';

const banco = new DatabaseSync('banco.db');

banco.exec(`
  PRAGMA foreign_keys=ON;

  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    nome TEXT NOT NULL,
    senha TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS estatisticas (
    usuario_id INTEGER PRIMARY KEY,
    sequencia_atual INTEGER DEFAULT 0,
    melhor_sequencia INTEGER DEFAULT 0,
    palavras_acertadas INTEGER DEFAULT 0,
    total_erros INTEGER DEFAULT 0,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
  );
`);

export function obterUsuario(username: string): Usuario | undefined {
  const r = banco
    .prepare('SELECT * FROM usuarios WHERE username=?')
    .get(username) as any;

  if (!r) return;

  return r as Usuario;
}

export function inserirUsuario(d: Omit<Usuario, 'id'>) {
  const r = banco
    .prepare(
      'INSERT INTO usuarios(username,nome,senha) VALUES(?,?,?)'
    )
    .run(d.username, d.nome, d.senha);

  const id = Number(r.lastInsertRowid);

  banco
    .prepare('INSERT INTO estatisticas(usuario_id) VALUES(?)')
    .run(id);
}

export function registrarVitoria(id: number, erros: number) {
  banco
    .prepare(
      'UPDATE estatisticas SET sequencia_atual=sequencia_atual+1, palavras_acertadas=palavras_acertadas+1,total_erros=total_erros+?,melhor_sequencia=MAX(melhor_sequencia,sequencia_atual+1) WHERE usuario_id=?'
    )
    .run(erros, id);
}

export function registrarDerrota(id: number, erros: number) {
  banco
    .prepare(
      'UPDATE estatisticas SET sequencia_atual=0,total_erros=total_erros+? WHERE usuario_id=?'
    )
    .run(erros, id);
}

export function minhasStats(id: number) {
  return banco
    .prepare('SELECT * FROM estatisticas WHERE usuario_id=?')
    .get(id) as any;
}

export function ranking(): Ranking[] {
  return banco
    .prepare(`
      SELECT
        u.nome,
        u.username,
        e.melhor_sequencia,
        e.total_erros,
        e.palavras_acertadas
      FROM estatisticas e
      JOIN usuarios u ON u.id=e.usuario_id
      ORDER BY
        e.melhor_sequencia DESC,
        e.total_erros ASC,
        e.palavras_acertadas DESC
      LIMIT 10
    `)
    .all() as any;
}