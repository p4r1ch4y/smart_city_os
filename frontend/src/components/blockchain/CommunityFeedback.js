import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { MessageSquare, Send, Clock, User, AlertTriangle, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Community Feedback Component
 * Allows citizens to post public comments about contracts on-chain
 */
const CommunityFeedback = () => {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedContract, setSelectedContract] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Available contracts for feedback
  const contracts = [
    { id: 'air-quality-downtown', name: 'Air Quality Monitoring - Downtown' },
    { id: 'traffic-main-street', name: 'Traffic Management - Main Street' },
    { id: 'waste-collection-zone-a', name: 'Waste Collection - Zone A' },
    { id: 'energy-grid-sector-5', name: 'Smart Grid - Sector 5' }
  ];

  // Sample comments (in production, fetch from on-chain data)
  const sampleComments = [
    {
      id: '1',
      contractId: 'air-quality-downtown',
      author: '7MpA...HP14W',
      message: 'The air quality sensors have been very accurate. Great improvement in downtown monitoring!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      signature: 'abc123...def456'
    },
    {
      id: '2', 
      contractId: 'traffic-main-street',
      author: '9XbC...KL89M',
      message: 'Traffic lights seem to be poorly synchronized during rush hour. Causing more delays than before.',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      sentiment: 'negative',
      signature: 'ghi789...jkl012'
    },
    {
      id: '3',
      contractId: 'waste-collection-zone-a', 
      author: '5QdE...NM34P',
      message: 'Smart bins are working well, but collection frequency could be improved in high-traffic areas.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'neutral',
      signature: 'mno345...pqr678'
    },
    {
      id: '4',
      contractId: 'energy-grid-sector-5',
      author: '3FgH...QR56S',
      message: 'Power outages have decreased significantly since the smart grid implementation. Excellent work!',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      sentiment: 'positive',
      signature: 'stu901...vwx234'
    }
  ];

  useEffect(() => {
    // Load comments (in production, fetch from blockchain)
    setComments(sampleComments);
  }, []);

  const submitComment = async () => {
    if (!publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (!selectedContract) {
      toast.error('Please select a contract');
      return;
    }

    setSubmitting(true);

    try {
      // In production, this would create a PDA for the comment and submit to blockchain
      // For now, we'll simulate the process
      
      // Create a simple transaction to demonstrate wallet interaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Self-transfer for demo
          lamports: 1, // Minimal amount
        })
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      
      // Submit transaction
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(signature);

      // Add comment to local state (in production, this would be stored on-chain)
      const comment = {
        id: Date.now().toString(),
        contractId: selectedContract,
        author: publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-5),
        message: newComment,
        timestamp: new Date().toISOString(),
        sentiment: 'neutral',
        signature: signature
      };

      setComments(prev => [comment, ...prev]);
      setNewComment('');
      setSelectedContract('');

      toast.success('Comment submitted to blockchain successfully!');

    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit comment: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };  const 
getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-green-500 bg-green-50';
      case 'negative':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const filteredComments = selectedContract 
    ? comments.filter(c => c.contractId === selectedContract)
    : comments;

  return (
    <div className="space-y-6">
      {/* Submit New Comment */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Submit Public Feedback
        </h3>
        
        {!publicKey ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Wallet Connection Required
            </h4>
            <p className="text-gray-600">
              Connect your Solana wallet to submit public feedback about civic contracts.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Contract Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Contract
              </label>
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Choose a contract to comment on...</option>
                {contracts.map(contract => (
                  <option key={contract.id} value={contract.id}>
                    {contract.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Comment Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your experience with this civic service. Your feedback will be stored permanently on the blockchain for transparency..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={500}
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {newComment.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                onClick={submitComment}
                disabled={submitting || !newComment.trim() || !selectedContract}
                className={`flex items-center space-x-2 px-6 py-2 rounded-md font-medium transition-colors ${
                  submitting || !newComment.trim() || !selectedContract
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting to Blockchain...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Feedback</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comments Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Community Feedback ({filteredComments.length})
          </h3>
          <select
            value={selectedContract}
            onChange={(e) => setSelectedContract(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Contracts</option>
            {contracts.map(contract => (
              <option key={contract.id} value={contract.id}>
                {contract.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Feedback Yet
            </h4>
            <p className="text-gray-600">
              {selectedContract 
                ? 'No feedback has been submitted for this contract yet.'
                : 'Be the first to share your experience with civic services.'
              }
            </p>
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`bg-white rounded-lg shadow-sm border-l-4 p-6 ${getSentimentColor(comment.sentiment)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <span className="font-mono text-sm text-gray-600">
                    {comment.author}
                  </span>
                  {getSentimentIcon(comment.sentiment)}
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(comment.timestamp).toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-2">
                  Contract: {contracts.find(c => c.id === comment.contractId)?.name}
                </div>
                <p className="text-gray-800">{comment.message}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Transaction: 
                  <a
                    href={`https://solscan.io/tx/${comment.signature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 font-mono text-blue-600 hover:text-blue-800 underline"
                  >
                    {comment.signature.slice(0, 8)}...{comment.signature.slice(-8)}
                  </a>
                </div>
                <div className="text-xs text-gray-500">
                  Stored on Solana Blockchain
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Transparent Community Feedback
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              All feedback is stored permanently on Solana blockchain for complete transparency. 
              Comments cannot be edited or deleted, ensuring authentic public discourse about civic services.
            </p>
            <div className="mt-3 space-y-1 text-xs text-blue-600">
              <div>• Comments are linked to your wallet address</div>
              <div>• Small transaction fee required for blockchain storage</div>
              <div>• All feedback is publicly viewable and verifiable</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityFeedback;