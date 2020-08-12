import { exec } from 'child_process';

const systemExec = async (input: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(input, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      }
      if (stdout) {
        resolve(stdout);
      }
    });
  });
};

export { systemExec };
