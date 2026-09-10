import type { MailboxLetter } from "./types";

export const MAILBOX_DIR = "mailbox";

type MailboxConfig = { token: string; repo: string; branch: string };

export function mailboxConfig(): MailboxConfig | null {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) return null;
  return { token, repo, branch: process.env.MAILBOX_BRANCH ?? "mailbox" };
}

/**
 * 手紙を GitHub の mailbox ブランチに1ファイルとして投函する。
 * デプロイ対象ブランチではないので、投函だけではビルドは走らない。
 */
export async function postToMailbox(letter: MailboxLetter, config: MailboxConfig): Promise<void> {
  const path = `${MAILBOX_DIR}/${letter.id}.json`;
  const url = `https://api.github.com/repos/${config.repo}/contents/${path}`;
  const body = {
    message: `letter: ${letter.from} から`,
    branch: config.branch,
    content: Buffer.from(JSON.stringify(letter, null, 2) + "\n").toString("base64"),
  };
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${res.status}: ${text.slice(0, 200)}`);
  }
}
