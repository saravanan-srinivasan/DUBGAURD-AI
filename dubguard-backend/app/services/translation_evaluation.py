import logging
import sacrebleu

logger = logging.getLogger("dubguard.translation_eval")

class TranslationEvaluationService:
    def __init__(self):
        self.semantic_model = None
        self.comet_model = None

    def _load_semantic_model(self):
        if self.semantic_model is None:
            logger.info("Loading SentenceTransformer model for Semantic Similarity...")
            from sentence_transformers import SentenceTransformer
            self.semantic_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

    def _load_comet_model(self):
        if self.comet_model is None:
            logger.info("Loading COMET model...")
            try:
                from comet import download_model, load_from_checkpoint
                # Using a standard COMET model
                model_path = download_model("Unbabel/wmt22-comet-da")
                self.comet_model = load_from_checkpoint(model_path)
            except ImportError:
                logger.error("COMET is not installed or failed to load.")
                raise

    def compute_bleu(self, reference: str, hypothesis: str) -> float:
        """Compute BLEU score using SacreBLEU."""
        if not reference.strip() or not hypothesis.strip():
            return 0.0
        bleu = sacrebleu.corpus_bleu([hypothesis], [[reference]])
        return bleu.score

    def compute_semantic_similarity(self, reference: str, hypothesis: str) -> float:
        """Compute Semantic Similarity using SentenceTransformers."""
        if not reference.strip() or not hypothesis.strip():
            return 0.0
        self._load_semantic_model()
        from sentence_transformers import util
        ref_emb = self.semantic_model.encode(reference, convert_to_tensor=True)
        hyp_emb = self.semantic_model.encode(hypothesis, convert_to_tensor=True)
        similarity = util.cos_sim(ref_emb, hyp_emb).item()
        return max(0.0, similarity)

    def compute_comet(self, source: str, hypothesis: str, reference: str) -> float:
        """Compute COMET score. Requires source language text as well."""
        if not source.strip() or not reference.strip() or not hypothesis.strip():
            return 0.0
        try:
            self._load_comet_model()
            data = [
                {"src": source, "mt": hypothesis, "ref": reference}
            ]
            # Run inference without forcing GPU if it's not available
            model_output = self.comet_model.predict(data, batch_size=8, gpus=0)
            return model_output.scores[0]
        except ImportError:
            logger.warning("COMET is not installed. Returning 0.0. Install unbabel-comet (e.g. via Docker) for full support.")
            return 0.0
        
    def evaluate(self, source: str, reference: str, hypothesis: str) -> dict:
        """Evaluate translation across BLEU, Semantic Similarity, and COMET."""
        return {
            "bleu": self.compute_bleu(reference, hypothesis),
            "semantic_similarity": self.compute_semantic_similarity(reference, hypothesis),
            "comet": self.compute_comet(source, hypothesis, reference)
        }

translation_eval_service = TranslationEvaluationService()
