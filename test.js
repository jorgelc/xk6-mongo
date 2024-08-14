import xk6_mongo from 'k6/x/mongo';

export const options = {
	setupTimeout: '40m',
	teardownTimeout: '40m',
	scenarios: {
		contacts: {
			executor: 'per-vu-iterations',
			vus: 1,
			iterations: 1,
			maxDuration: '80m',
		},
	},
};

const client = xk6_mongo.newClient(`mongodb://mongo-user:mongo-password@127.0.0.1:27017/admin?connect=direct&appName=loadtest`)
const collectionName = "contact-projection"
const dbName = "contact-martech"

export function setup() {
	const numOfRecords = 20000
	const batchNumber = 5000
	let cpCollection = Array.from(Array(batchNumber).keys())
	for (let i = 0; i < numOfRecords; i++) {
		cpCollection[i % batchNumber] = {
           _id: `email_${i}@emailreaction.org`,
           value: `${i}` 
        }
		if ((i + 1) % batchNumber === 0) {
            client.insertMany(dbName, collectionName, cpCollection)
		}
	}
}

export default function () {
	loadTest()
}

export function teardown(data) {
	client.deleteMany(dbName, collectionName, {})
}

async function loadTest() {
    for (let i = 0; i < 30; i++) {
        let id = `email_${i}@emailreaction.org`
        let doc = await queryAndWait(id)
        console.log(`iteration ${i} doc ${JSON.stringify(doc)}`)
    }
}
function queryAndWait(id) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(client.findOne(dbName, collectionName, {_id: id})), 1000);
    });
}