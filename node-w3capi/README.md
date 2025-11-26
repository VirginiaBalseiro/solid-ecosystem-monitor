# Solid CG Election Tools

Tools to determine eligible voters in [Solid CG Chair](https://www.w3.org/community/solid/charter/#chairs) [elections](https://www.w3.org/community/solid/charter/#choosing-a-chair).

The results can also be used to determine nominees with unique affiliations.

## Usage

1. Clone the repository
1. Navigate to `node-w3capi` (this directory)
1. Install dependencies: `npm ci`
1. Run `npm start`
1. See the results in `data` directory

### Generate list of eligible voters

1. Make a copy of default voters table: `cp data/affiliation-default-voters.md data/affiliation-designated-voters.md`
1. Open `affiliation-designated-voters.md` and edit `Designated` column as needed
1. Re-run the script: `npm start`
1. See the results in `data/eligible-voters.txt`

## Output

Output can be found in `data` directory.

### affiliation-default-voters.md

### eligible-voters.txt

### orgs.json

### participants.html

### participants.txt

A snapshot of CG participants (humans) as plaintext

### users.json
