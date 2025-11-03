#!/usr/bin/env python3
"""
Script de backup automatique pour CAMEG-CHAIN
"""
import os
import sys
import subprocess
import boto3
import gzip
import shutil
from datetime import datetime, timedelta
from pathlib import Path
import logging
from botocore.exceptions import ClientError

# Configuration du logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('backup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DatabaseBackup:
    """Gestionnaire de backup de base de données"""
    
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'database': os.getenv('DB_NAME', 'CAMEG-CHAIN'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres')
        }
        
        self.s3_config = {
            'bucket': os.getenv('S3_BACKUP_BUCKET', 'cameg-chain-backups'),
            'region': os.getenv('AWS_REGION', 'us-east-1'),
            'access_key': os.getenv('AWS_ACCESS_KEY_ID'),
            'secret_key': os.getenv('AWS_SECRET_ACCESS_KEY')
        }
        
        self.backup_dir = Path('backups')
        self.backup_dir.mkdir(exist_ok=True)
    
    def create_database_backup(self) -> str:
        """Créer un backup de la base de données"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_filename = f"cameg_chain_backup_{timestamp}.sql"
        backup_path = self.backup_dir / backup_filename
        
        logger.info(f"Création du backup: {backup_filename}")
        
        # Variables d'environnement pour pg_dump
        env = os.environ.copy()
        env['PGPASSWORD'] = self.db_config['password']
        
        # Commande pg_dump
        cmd = [
            'pg_dump',
            '-h', self.db_config['host'],
            '-p', str(self.db_config['port']),
            '-U', self.db_config['user'],
            '-d', self.db_config['database'],
            '--verbose',
            '--clean',
            '--create',
            '--if-exists',
            '--format=plain'
        ]
        
        try:
            with open(backup_path, 'w') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=subprocess.PIPE,
                    env=env,
                    check=True
                )
            
            logger.info(f"Backup créé avec succès: {backup_path}")
            return str(backup_path)
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Erreur lors de la création du backup: {e.stderr.decode()}")
            raise
    
    def compress_backup(self, backup_path: str) -> str:
        """Compresser le backup avec gzip"""
        compressed_path = f"{backup_path}.gz"
        
        logger.info(f"Compression du backup: {compressed_path}")
        
        with open(backup_path, 'rb') as f_in:
            with gzip.open(compressed_path, 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        
        # Supprimer le fichier non compressé
        os.remove(backup_path)
        
        logger.info(f"Backup compressé: {compressed_path}")
        return compressed_path
    
    def upload_to_s3(self, backup_path: str) -> str:
        """Uploader le backup vers S3"""
        if not all([self.s3_config['access_key'], self.s3_config['secret_key']]):
            logger.warning("Configuration S3 manquante, backup local uniquement")
            return backup_path
        
        s3_client = boto3.client(
            's3',
            aws_access_key_id=self.s3_config['access_key'],
            aws_secret_access_key=self.s3_config['secret_key'],
            region_name=self.s3_config['region']
        )
        
        backup_filename = Path(backup_path).name
        s3_key = f"database/{backup_filename}"
        
        try:
            logger.info(f"Upload vers S3: s3://{self.s3_config['bucket']}/{s3_key}")
            
            s3_client.upload_file(
                backup_path,
                self.s3_config['bucket'],
                s3_key,
                ExtraArgs={
                    'ServerSideEncryption': 'AES256',
                    'StorageClass': 'STANDARD_IA'
                }
            )
            
            logger.info("Upload S3 réussi")
            return s3_key
            
        except ClientError as e:
            logger.error(f"Erreur upload S3: {e}")
            raise
    
    def cleanup_old_backups(self, days_to_keep: int = 7):
        """Nettoyer les anciens backups"""
        cutoff_date = datetime.now() - timedelta(days=days_to_keep)
        
        logger.info(f"Nettoyage des backups antérieurs à {cutoff_date}")
        
        # Nettoyer les backups locaux
        for backup_file in self.backup_dir.glob("*.sql.gz"):
            file_time = datetime.fromtimestamp(backup_file.stat().st_mtime)
            if file_time < cutoff_date:
                backup_file.unlink()
                logger.info(f"Backup local supprimé: {backup_file}")
        
        # Nettoyer les backups S3
        if all([self.s3_config['access_key'], self.s3_config['secret_key']]):
            self._cleanup_s3_backups(cutoff_date)
    
    def _cleanup_s3_backups(self, cutoff_date: datetime):
        """Nettoyer les anciens backups S3"""
        s3_client = boto3.client(
            's3',
            aws_access_key_id=self.s3_config['access_key'],
            aws_secret_access_key=self.s3_config['secret_key'],
            region_name=self.s3_config['region']
        )
        
        try:
            response = s3_client.list_objects_v2(
                Bucket=self.s3_config['bucket'],
                Prefix='database/'
            )
            
            for obj in response.get('Contents', []):
                if obj['LastModified'].replace(tzinfo=None) < cutoff_date:
                    s3_client.delete_object(
                        Bucket=self.s3_config['bucket'],
                        Key=obj['Key']
                    )
                    logger.info(f"Backup S3 supprimé: {obj['Key']}")
                    
        except ClientError as e:
            logger.error(f"Erreur nettoyage S3: {e}")
    
    def restore_database(self, backup_path: str):
        """Restaurer la base de données depuis un backup"""
        logger.info(f"Restauration depuis: {backup_path}")
        
        # Variables d'environnement pour psql
        env = os.environ.copy()
        env['PGPASSWORD'] = self.db_config['password']
        
        # Commande psql
        cmd = [
            'psql',
            '-h', self.db_config['host'],
            '-p', str(self.db_config['port']),
            '-U', self.db_config['user'],
            '-d', 'postgres'  # Se connecter à la DB par défaut
        ]
        
        try:
            with open(backup_path, 'r') as f:
                result = subprocess.run(
                    cmd,
                    stdin=f,
                    stderr=subprocess.PIPE,
                    env=env,
                    check=True
                )
            
            logger.info("Restauration réussie")
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Erreur lors de la restauration: {e.stderr.decode()}")
            raise

def main():
    """Fonction principale"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Gestionnaire de backup CAMEG-CHAIN")
    parser.add_argument('--action', choices=['backup', 'restore', 'cleanup'], 
                       default='backup', help='Action à effectuer')
    parser.add_argument('--backup-file', help='Fichier de backup pour restauration')
    parser.add_argument('--days-to-keep', type=int, default=7, 
                       help='Nombre de jours de rétention des backups')
    
    args = parser.parse_args()
    
    backup_manager = DatabaseBackup()
    
    try:
        if args.action == 'backup':
            # Créer le backup
            backup_path = backup_manager.create_database_backup()
            
            # Compresser
            compressed_path = backup_manager.compress_backup(backup_path)
            
            # Uploader vers S3
            s3_key = backup_manager.upload_to_s3(compressed_path)
            
            logger.info("Backup terminé avec succès")
            
        elif args.action == 'restore':
            if not args.backup_file:
                logger.error("Fichier de backup requis pour la restauration")
                sys.exit(1)
            
            backup_manager.restore_database(args.backup_file)
            
        elif args.action == 'cleanup':
            backup_manager.cleanup_old_backups(args.days_to_keep)
            
    except Exception as e:
        logger.error(f"Erreur: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
