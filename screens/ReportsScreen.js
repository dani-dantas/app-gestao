// screens/ReportsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryPie } from 'victory-native';
import firestore from '@react-native-firebase/firestore';

const ReportsScreen = () => {
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);
  const [selectedReport, setSelectedReport] = useState('seasonality');

  useEffect(() => {
    // Buscar dados de vendas (simulação)
    const sales = [
      { month: 'Jan', sales: 12000 },
      { month: 'Fev', sales: 19000 },
      { month: 'Mar', sales: 15000 },
      { month: 'Abr', sales: 18000 },
      { month: 'Mai', sales: 9000 },
      { month: 'Jun', sales: 11000 },
      { month: 'Jul', sales: 25000 }, // Alta em julho (férias)
      { month: 'Ago', sales: 21000 },
      { month: 'Set', sales: 17000 },
      { month: 'Out', sales: 16000 },
      { month: 'Nov', sales: 19000 },
      { month: 'Dez', sales: 23000 },
    ];
    setSalesData(sales);

    // Buscar dados de estoque
    const fetchStockData = async () => {
      const snapshot = await firestore()
        .collection('products')
        .orderBy('currentQuantity', 'desc')
        .limit(10)
        .get();
      
      const stock = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        quantity: doc.data().currentQuantity,
      }));
      
      setStockData(stock);
    };

    fetchStockData();
  }, []);

  // Calcular curva ABC
  const calculateABCCurve = () => {
    const sortedStock = [...stockData].sort((a, b) => b.quantity - a.quantity);
    const total = sortedStock.reduce((sum, item) => sum + item.quantity, 0);
    
    return sortedStock.map((item, index) => {
      const cumulative = sortedStock
        .slice(0, index + 1)
        .reduce((sum, i) => sum + i.quantity, 0);
      
      const percentage = (cumulative / total) * 100;
      
      let category = 'C';
      if (percentage <= 80) category = 'A';
      else if (percentage <= 95) category = 'B';
      
      return { ...item, category };
    });
  };

  const abcData = calculateABCCurve();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.reportSelector}>
        <TouchableOpacity
          style={[styles.selectorButton, selectedReport === 'seasonality' && styles.activeButton]}
          onPress={() => setSelectedReport('seasonality')}
        >
          <Text style={styles.selectorText}>Sazonalidade</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.selectorButton, selectedReport === 'abc' && styles.activeButton]}
          onPress={() => setSelectedReport('abc')}
        >
          <Text style={styles.selectorText}>Curva ABC</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.selectorButton, selectedReport === 'stock' && styles.activeButton]}
          onPress={() => setSelectedReport('stock')}
        >
          <Text style={styles.selectorText}>Estoque</Text>
        </TouchableOpacity>
      </View>

      {selectedReport === 'seasonality' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Vendas Mensais (Sazonalidade)</Text>
          <VictoryChart theme={VictoryTheme.material}>
            <VictoryBar
              data={salesData}
              x="month"
              y="sales"
              style={{ data: { fill: '#3498db' } }}
            />
          </VictoryChart>
          <Text style={styles.insight}>
            Insight: Alta nas vendas em julho (férias) e dezembro (natal)
          </Text>
        </View>
      )}

      {selectedReport === 'abc' && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Curva ABC de Estoque</Text>
          <VictoryPie
            data={abcData.map(item => ({ 
              x: item.name, 
              y: item.quantity,
              label: `${item.name}\n(${item.category})`
            })}
            colorScale={['#e74c3c', '#f39c12', '#2ecc71']}
            innerRadius={70}
            labelRadius={100}
            style={{ labels: { fontSize: 10, fill: 'white' } }}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.legendText}>Categoria A (20% itens, 80% valor)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#f39c12' }]} />
              <Text style={styles.legendText}>Categoria B (30% itens, 15% valor)</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
              <Text style={styles.legendText}>Categoria C (50% itens, 5% valor)</Text>
            </View>
          </View>
        </View>
      )}

      {selectedReport === 'stock' && (
        <View style={styles.stockContainer}>
          <Text style={styles.chartTitle}>Top 10 Itens em Estoque</Text>
          {stockData.map((item, index) => (
            <View key={item.id} style={styles.stockItem}>
              <Text style={styles.stockPosition}>{index + 1}</Text>
              <Text style={styles.stockName}>{item.name}</Text>
              <Text style={styles.stockQuantity}>{item.quantity} unidades</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f9f9f9',
  },
  reportSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  selectorButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#3498db',
  },
  selectorText: {
    color: '#333',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  insight: {
    marginTop: 15,
    fontStyle: 'italic',
    color: '#7f8c8d',
    textAlign: 'center',
  },
  legend: {
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
  },
  stockContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  stockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  stockPosition: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 30,
    textAlign: 'center',
    color: '#3498db',
  },
  stockName: {
    flex: 1,
    fontSize: 16,
  },
  stockQuantity: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#27ae60',
  },
});

export default ReportsScreen;