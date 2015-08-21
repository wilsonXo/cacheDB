/**
 * Wilsonx 2015/8/17
 * Simple database base on LocalStorage
 */

(function(window, document, undefined) {

	//define constructed
	//argument 1 : table name
	var _ = function(namespace) {
		return new _.fn.init(namespace);
	}

	//generate unique id for each instance
	_._uuid = function() {
		return "xxxxxx".replace(/x/g, function() {
			return (Math.random() * 16 | 0).toString(16);
		})
	}

	var fn = _.fn = _.prototype;

	fn.init = function(tableName) {
		this.uuid = _._uuid();
		this.tableName = tableName;
		this.instance = {
			namespace: tableName,
			db: {}
		}
		this.open(tableName);
	}

	//fix fn.init constructed
	fn.init.prototype = _.prototype;

	//simple way to extend instance prototype
	_.extend = function(obj) {
		for (var i in obj) {
			_.fn[i] = obj[i];
		}
	};

	_.extend({
		//open specified table
		//argument 1:table name
		open: function(tableName) {
			var dbStr = localStorage.getItem(tableName);
			var db = {};
			if (dbStr) {
				var tmpDB = JSON.parse(dbStr);
				for (var i in tmpDB) {
					var tmpCollection = new DBCollection(tmpDB[i]);
					this.addCollection(tmpCollection);
				}
			}
			return db
		},
		//get current instance data struct.
		getDB: function() {
			return this.instance;
		},
		empty: function() {
			this.instance.db = {};
			this._persistence();
		},
		getCollection: function(key) {
			return this.instance.db[key] || new DBCollection({}, key);
		},
		set: function(key, val) {
			this.instance.db[key] = val;
			this._persistence();
		},
		get: function(key) {
			return this.instance.db[key];
		},
		save: function() {
			debugger;
			this._persistence();
		},
		addCollection: function(collection) {
			this.instance.db[collection.name] = collection;
		},
		//data can be persisted into LocalStorage
		_persistence: function() {
			localStorage.setItem(this.tableName, JSON.stringify(this.instance.db));
		}
	});


	//define simple object struct
	var DBObject = _.DBObject = function(data) {

		this._id = data._id || _._uuid();
		this.data = {};

		if (data._id) {
			this.data = data.data
		} else {
			for (var i in data) {
				this.data[i] = data[i];
			}
		}
	}

	DBObject.prototype = {
		set: function(obj) {
			for (var i in obj) {
				this.data[i] = obj[i];
			}
		},
		get: function(key) {
			return this.data[key];
		},
		getPlain: function() {
			return this.data;
		}
	}

	//define collection struct
	var DBCollection = _.DBCollection = function(data, name) {

		this.collection = [];
		this.name = name;
		this._index = {};

		if (data.name && data.collection && data._index) {
			this.name = data.name;
			this._index = data._index;
			for (var i = 0, len = data.collection.length; i < len; i++) {
				var tmpDBObject = new DBObject(data.collection[i]);
				this.add(tmpDBObject);
			}
		}

	}

	DBCollection.prototype = {
		get: function(index) {
			return this.collection[index];
		},
		add: function(dbObject) {
			var idx = this._searchByIndex(dbObject._id);
			if (idx) {
				this.collection[idx] = dbObject;
			} else {
				this.collection.push(dbObject);
			}
			this._generateIndex();
		},
		//remove object from collection by locale id (auto generate)
		cut: function(id) {
			//TODO..
		},
		//remove object from collection by data index that in collection
		removeAt: function(idx) {
			//TODO..
		},
		remove: function(option) {
			var self = this;
			var tmp = this.where(option).map(function(key, val) {
				return self._getIndex(val._id);
			});
			for (var i = 0, len = tmp.length; i < len; i++) {
				this.collection.splice(tmp[i], 1);
			}
		},
		each: function(handler) {
			var self = this;
			for (var i = 0, len = this.collection.length; i < len; i++) {
				var item = this.collection[i];
				handler.call(self, i, item);
			}
		},
		map: function(handler) {
			var self = this;
			var ret = [];
			this.each(function(idx, val) {
				ret.push(handler.call(self, idx, val));
			});
			return ret;
		},
		where: function(conditions) {
			var result = new DBCollection([], "$tmp_" + _._uuid());
			if (conditions["_id"]) {
				result.add(_._searchByIndex(conditions["_id"]));
			} else {
				for (var i in conditions) {
					var condition = conditions[i];
					for (var j = 0, len = this.collection.length; j < len; j++) {
						var cur = this.collection[j];
						if (cur.get(i) === condition) {
							result.add(cur);
						}
					}
				}
			}
			return result;
		},
		_generateIndex: function() {
			if (this.collection) {
				for (var i = 0, len = this.collection.length; i < len; i++) {
					var cur = this.collection[i];
					this._index[cur._id] = i;
				}
			}
		},
		//arguments 1:object locale id
		_searchByIndex: function(id) {
			return this.collection[this._getIndex(id)];
		},
		_getIndex: function(id) {
			return this._index[id];
		}
	};

	if (typeof define === 'function' && define.amd) {
		define('cacheDB', function() {
			return _;
		})
	} else {
		window.cacheDB = _;
	}

})(window, document);