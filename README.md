# cacheDB v1.0
A simple database layer for localStorage;

# Usage / Examples
### Creating a database

```javascript
// Initialise. If the database doesn't exist, it is created
var db = cacheDB('myDB');

//If the collection doesn't exist,it is created,otherwise return an DBCollection
var collection = db.getCollection('myCollection');

//Constructs an DBObjects
var wilson = new cacheDB.DBObject({
  name:'wilson',
  age:23
});

//insert to collection
collection.add(wilson);

//insert to db
db.addCollection(collection);

//commit the database to localStorage
db.save()
```

###Query
```javascript
db.getCollection('items').where({
	name:"wilson"
})
```

###remove
```javascript
db.getCollection('items').remove({
	name:'wilson'
});
```