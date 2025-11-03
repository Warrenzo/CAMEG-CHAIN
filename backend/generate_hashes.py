import bcrypt

# Générer les hash bcrypt pour les deux mots de passe
password1 = "@Obed#91.64.77.53"
password2 = "Very@Hard//4Me.88"

hash1 = bcrypt.hashpw(password1.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')
hash2 = bcrypt.hashpw(password2.encode('utf-8'), bcrypt.gensalt(12)).decode('utf-8')

print("Hash pour @Obed#91.64.77.53:")
print(hash1)
print("\nHash pour Very@Hard//4Me.88:")
print(hash2)
