// screens/DashboardScreen.js
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import StockSummary from '../components/StockSummary';
import SalesChart from '../components/SalesChart';

const DashboardScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Bem-vindo, {user?.email || 'Usuário'}!</Text>
      
      <StockSummary />
      
      <SalesChart />
      
      <View style={styles.menu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Stock')}
        >
          <Text style={styles.menuText}>Gerenciar Estoque</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Reports')}
        >
          <Text style={styles.menuText}>Relatórios Analíticos</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={logout}
        >
          <Text style={styles.menuText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  welcome: {
    fontSize: 20,
    marginBottom: 20,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  menu: {
    marginTop: 30,
  },
  menuItem: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  menuText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;