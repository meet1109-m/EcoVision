import pandas as pd
from sklearn.model_selection import train_test_split

def main():
    import os
    dataset_dir = "dataset" if os.path.exists("dataset") else "."
    dataset_path = os.path.join(dataset_dir, "industrial_leak_training_50k.csv")
    train_path = os.path.join(dataset_dir, "train_data.csv")
    test_path = os.path.join(dataset_dir, "test_data.csv")
    
    print(f"Loading dataset from '{dataset_path}'...")
    df = pd.read_csv(dataset_path)
    
    total_rows = len(df)
    target_col = "incident_label"
    
    label_names = {
        0: "Normal (0)",
        1: "Warning (1)",
        2: "Leak Suspected (2)",
        3: "Confirmed Leak (3)"
    }
    
    print(f"Total rows loaded: {total_rows:,}")
    print(f"Target column: '{target_col}'\n")
    
    # Stratified Train-Test Split (80% train, 20% test)
    print("Performing stratified 80/20 train/test split with random_state=42...")
    train_df, test_df = train_test_split(
        df,
        test_size=0.20,
        random_state=42,
        stratify=df[target_col]
    )
    
    # Save splits to CSV
    print(f"Saving training set to '{train_path}'...")
    train_df.to_csv(train_path, index=False)
    
    print(f"Saving testing set to '{test_path}'...")
    test_df.to_csv(test_path, index=False)
    print("Files saved successfully!\n")
    
    # Verification & Distribution Reporting
    def get_distribution_table(data: pd.DataFrame, name: str) -> pd.DataFrame:
        counts = data[target_col].value_counts().sort_index()
        pcts = data[target_col].value_counts(normalize=True).sort_index() * 100
        
        table = pd.DataFrame({
            "Class Name": [label_names.get(cls, str(cls)) for cls in counts.index],
            "Count": counts.values,
            "Percentage (%)": pcts.round(2).values
        }, index=counts.index)
        return table
    
    full_dist = get_distribution_table(df, "Original Dataset")
    train_dist = get_distribution_table(train_df, "Train Set")
    test_dist = get_distribution_table(test_df, "Test Set")
    
    print("=" * 65)
    print("DATASET SPLIT & CLASS DISTRIBUTION SUMMARY")
    print("=" * 65)
    
    print(f"\n1. ORIGINAL DATASET: {len(df):,} rows")
    print(full_dist.to_string(index=False))
    
    print(f"\n2. TRAIN SET (80%): {len(train_df):,} rows")
    print(train_dist.to_string(index=False))
    
    print(f"\n3. TEST SET (20%): {len(test_df):,} rows")
    print(test_dist.to_string(index=False))
    
    print("\n" + "=" * 65)
    print("COMPARISON TABLE (Class Proportions)")
    print("=" * 65)
    comp_df = pd.DataFrame({
        "Incident Class": [label_names.get(i, str(i)) for i in sorted(df[target_col].unique())],
        "Original Count": df[target_col].value_counts().sort_index().values,
        "Original (%)": (df[target_col].value_counts(normalize=True).sort_index() * 100).round(2).values,
        "Train Count": train_df[target_col].value_counts().sort_index().values,
        "Train (%)": (train_df[target_col].value_counts(normalize=True).sort_index() * 100).round(2).values,
        "Test Count": test_df[target_col].value_counts().sort_index().values,
        "Test (%)": (test_df[target_col].value_counts(normalize=True).sort_index() * 100).round(2).values,
    })
    print(comp_df.to_string(index=False))
    print("=" * 65)

if __name__ == "__main__":
    main()
