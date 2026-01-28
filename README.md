### Commandes

```
npm init
npm install express influx ws
npm install --save-dev nodemon
```
```
npx gitignore node
```
**watcher qui déclenche un callback ou lire en asynchrone**


serveur fakesonde
```
npm start
cat /dev/shm/sensors
tail -f /dev/shm/sensors
```
set up de la base de données
```
docker run -d --name mongotsi -p 27017:27017 mongo
npm install mongodb --save
```
executer mongoshell 
```
docker exec -ti mongotsi mongosh

https://buzut.net/commandes-de-base-de-mongodb/

db.meteo_data.findOne({_id: ObjectId('697a34f7f2cb59f5ef320db0')})


```
