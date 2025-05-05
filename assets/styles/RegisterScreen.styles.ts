import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    backgroundColor: '#9747FF',
    paddingVertical: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  linkText: {
    color: '#A678F1',
    textDecorationLine: 'underline',
    fontSize: 16,
    marginTop: 20,
  },
});

export default styles;
