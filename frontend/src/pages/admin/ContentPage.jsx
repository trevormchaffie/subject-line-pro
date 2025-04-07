import AdminLayout from "../../components/admin/layout/AdminLayout";

const ContentPage = () => {
  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Content Management</h2>
        <p className="text-gray-600">Content Management features coming in Step 5.</p>
        
        <div className="mt-4 p-4 bg-purple-50 rounded border border-purple-200">
          <h3 className="text-lg font-medium text-purple-700 mb-2">Coming Soon!</h3>
          <p className="text-purple-600">
            This page will include functionality for:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-purple-700">
            <li>Managing spam trigger keywords</li>
            <li>Customizing power word library</li>
            <li>Creating suggestion templates</li>
            <li>A/B testing framework for subject lines</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentPage;
