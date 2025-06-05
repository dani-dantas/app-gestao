// screens/StockManagementScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

const StockManagementScreen = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    code: '',
    minQuantity: '5',
    currentQuantity: '0',
    category: 'Peça'
  });

  useEffect(() => {
    const subscriber = firestore()
      .collection('products')
      .onSnapshot(querySnapshot => {
        const productsData = [];
        querySnapshot.forEach(documentSnapshot => {
          productsData.push({
            id: documentSnapshot.id,
            ...documentSnapshot.data(),
          });
        });
        setProducts(productsData);
      });

    return () => subscriber();
  }, []);

  const addProduct = async () => {
    await firestore().collection('products').add({
      ...newProduct,
      minQuantity: parseInt(newProduct.minQuantity),
      currentQuantity: parseInt(newProduct.currentQuantity),
      lastUpdated: firestore.FieldValue.serverTimestamp(),
    });
    setNewProduct({
      name: '',
      code: '',
      minQuantity: '5',
      currentQuantity: '0',
      category: 'Peça'
    });
  };

  const updateQuantity = async (id, change) => {
    const product = products.find(p => p.id === id);
    const newQuantity = product.currentQuantity + change;
    
    if (newQuantity >= 0) {
      await firestore()
        .collection('products')
        .doc(id)
        .update({
          currentQuantity: newQuantity,
          lastUpdated: firestore.FieldValue.serverTimestamp(),
        });
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.code.toLowerCase().includes(search.toLowerCase())
  );

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text>Código: {item.code}</Text>
        <Text style={item.currentQuantity <= item.minQuantity ? styles.lowStock : styles.okStock}>
          Estoque: {item.currentQuantity} (Mín: {item.minQuantity})
        </Text>
      </View>
      
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={styles.quantityButton} 
          onPress={() => updateQuantity(item.id, -1)}
        >
          <Icon name="remove" size={24} color="#e74c3c" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quantityButton} 
          onPress={() => updateQuantity(item.id, 1)}
        >
          <Icon name="add" size={24} color="#2ecc71" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar produto..."
        value={search}
        onChangeText={setSearch}
      />
      
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      
      <View style={styles.addForm}>
        <Text style={styles.sectionTitle}>Adicionar Novo Produto</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Nome do produto"
          value={newProduct.name}
          onChangeText={text => setNewProduct({...newProduct, name: text})}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Código"
          value={newProduct.code}
          onChangeText={text => setNewProduct({...newProduct, code: text})}
        />
        
        <View style={styles.quantityRow}>
          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="Qtd. mínima"
            value={newProduct.minQuantity}
            onChangeText={text => setNewProduct({...newProduct, minQuantity: text})}
            keyboardType="numeric"
          />
          
          <TextInput
            style={[styles.input, styles.quantityInput]}
            placeholder="Qtd. atual"
            value={newProduct.currentQuantity}
            onChangeText={text => setNewProduct({...newProduct, currentQuantity: text})}
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity style={styles.addButton} onPress={addProduct}>
          <Text style={styles.addButtonText}>Adicionar ao Estoque</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  listContent: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  lowStock: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  okStock: {
    color: '#27ae60',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  addForm: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 15,
    color: '#2c3e50',
  },
  input: {
    height: 45,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quantityInput: {
    width: '48%',
  },
  addButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StockManagementScreen;